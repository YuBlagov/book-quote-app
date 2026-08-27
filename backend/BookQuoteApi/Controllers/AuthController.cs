using BookQuoteApi.Data;
using BookQuoteApi.Dtos;
using BookQuoteApi.Models;
using BookQuoteApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db,
    PasswordHasher<User> passwordHasher,
    TokenService tokenService
) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var usernameTaken = await db.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameTaken)
        {
            return Conflict(new { message = "Username is already taken." });
        }

        var user = new User { Username = request.Username };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        db.Quotes.AddRange(SeedQuotes(user.Id));
        await db.SaveChangesAsync();

        var (token, expiresAt) = tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Username, expiresAt));
    }

    // New users start out with 5 quotes already on "Mina citat", so the page isn't empty
    // the first time they open it. They're free to edit, delete, or add more from there —
    // there's no cap on how many quotes a user can keep.
    private static List<Quote> SeedQuotes(int userId) =>
    [
        new Quote { UserId = userId, Text = "It is our choices, Harry, that show what we truly are, far more than our abilities.", Author = "J.K. Rowling" },
        new Quote { UserId = userId, Text = "All happy families are alike; each unhappy family is unhappy in its own way.", Author = "Leo Tolstoy" },
        new Quote { UserId = userId, Text = "So it goes.", Author = "Kurt Vonnegut" },
        new Quote { UserId = userId, Text = "I am no bird; and no net ensnares me: I am a free human being with an independent will.", Author = "Charlotte Brontë" },
        new Quote { UserId = userId, Text = "Not all those who wander are lost.", Author = "J.R.R. Tolkien" },
    ];

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var (token, expiresAt) = tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Username, expiresAt));
    }
}

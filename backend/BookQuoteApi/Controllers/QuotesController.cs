using System.Security.Claims;
using BookQuoteApi.Data;
using BookQuoteApi.Dtos;
using BookQuoteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/quotes")]
[Authorize]
public class QuotesController(AppDbContext db) : ControllerBase
{
    // Quotes are personal, so every action is scoped to the caller's own user id from the JWT.
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<QuoteDto>>> GetAll()
    {
        var quotes = await db.Quotes
            .Where(q => q.UserId == CurrentUserId)
            .Select(q => new QuoteDto(q.Id, q.Text, q.Author))
            .ToListAsync();
        return Ok(quotes);
    }

    [HttpPost]
    public async Task<ActionResult<QuoteDto>> Create(QuoteInput input)
    {
        var quote = new Quote
        {
            Text = input.Text,
            Author = input.Author,
            UserId = CurrentUserId,
        };

        db.Quotes.Add(quote);
        await db.SaveChangesAsync();

        return Ok(new QuoteDto(quote.Id, quote.Text, quote.Author));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, QuoteInput input)
    {
        var quote = await db.Quotes.SingleOrDefaultAsync(q => q.Id == id && q.UserId == CurrentUserId);
        if (quote is null) return NotFound();

        quote.Text = input.Text;
        quote.Author = input.Author;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var quote = await db.Quotes.SingleOrDefaultAsync(q => q.Id == id && q.UserId == CurrentUserId);
        if (quote is null) return NotFound();

        db.Quotes.Remove(quote);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

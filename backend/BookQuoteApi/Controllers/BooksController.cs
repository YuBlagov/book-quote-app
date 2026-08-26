using BookQuoteApi.Data;
using BookQuoteApi.Dtos;
using BookQuoteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/books")]
[Authorize] // Every action here requires a valid JWT (see Program.cs for validation setup).
public class BooksController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BookDto>>> GetAll()
    {
        var books = await db.Books
            .OrderByDescending(b => b.Id)
            .Select(b => new BookDto(b.Id, b.Title, b.Author, b.PublishedDate))
            .ToListAsync();
        return Ok(books);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookDto>> GetById(int id)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();
        return Ok(new BookDto(book.Id, book.Title, book.Author, book.PublishedDate));
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> Create(BookInput input)
    {
        var book = new Book
        {
            Title = input.Title,
            Author = input.Author,
            PublishedDate = input.PublishedDate,
        };

        db.Books.Add(book);
        await db.SaveChangesAsync();

        var dto = new BookDto(book.Id, book.Title, book.Author, book.PublishedDate);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookInput input)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        book.Title = input.Title;
        book.Author = input.Author;
        book.PublishedDate = input.PublishedDate;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        db.Books.Remove(book);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

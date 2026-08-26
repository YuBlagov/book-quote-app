using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.Dtos;

public record BookDto(int Id, string Title, string Author, DateTime PublishedDate);

public record BookInput(
    [Required] string Title,
    [Required] string Author,
    [Required] DateTime PublishedDate
);

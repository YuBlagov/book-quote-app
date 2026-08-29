using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.Dtos;

public record BookDto(int Id, string Title, string Author, DateTime? PublishedDate);

// PublishedDate is intentionally optional — not every book has (or needs) a known
// publication date on record, so it's nullable end-to-end (here, the entity, and the
// frontend form) rather than blocking submission when it's left blank.
public record BookInput(
    [Required] string Title,
    [Required] string Author,
    DateTime? PublishedDate
);

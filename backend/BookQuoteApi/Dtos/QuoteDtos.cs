using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.Dtos;

public record QuoteDto(int Id, string Text, string Author);

public record QuoteInput(
    [Required] string Text,
    [Required] string Author
);

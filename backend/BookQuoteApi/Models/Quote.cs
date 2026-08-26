namespace BookQuoteApi.Models;

public class Quote
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;

    // Quotes are personal ("Mina citat"), so each one belongs to the user who added it.
    public int UserId { get; set; }
    public User? User { get; set; }
}

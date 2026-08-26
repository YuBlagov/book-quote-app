import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Quote, QuoteInput } from '../../core/models/quote.model';
import { QuoteService } from '../../core/services/quote.service';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './quotes.html',
})
export class Quotes implements OnInit {
  quotes = signal<Quote[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Form state, shared between "add" and "edit" (editingId === null means "adding new").
  editingId = signal<number | null>(null);
  draft: QuoteInput = { text: '', author: '' };

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.quoteService.getAll().subscribe({
      next: (quotes) => {
        this.quotes.set(quotes);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load quotes.');
        this.isLoading.set(false);
      },
    });
  }

  startEdit(quote: Quote): void {
    this.editingId.set(quote.id);
    this.draft = { text: quote.text, author: quote.author };
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.draft = { text: '', author: '' };
  }

  save(): void {
    const id = this.editingId();

    if (id === null) {
      this.quoteService.create(this.draft).subscribe({
        next: (created) => {
          this.quotes.set([...this.quotes(), created]);
          this.draft = { text: '', author: '' };
        },
        error: () => this.errorMessage.set('Could not add the quote.'),
      });
    } else {
      this.quoteService.update(id, this.draft).subscribe({
        next: () => {
          this.quotes.set(
            this.quotes().map((q) => (q.id === id ? { ...q, ...this.draft } : q))
          );
          this.cancelEdit();
        },
        error: () => this.errorMessage.set('Could not update the quote.'),
      });
    }
  }

  remove(quote: Quote): void {
    if (!confirm('Delete this quote?')) return;

    this.quoteService.delete(quote.id).subscribe({
      next: () => this.quotes.set(this.quotes().filter((q) => q.id !== quote.id)),
      error: () => this.errorMessage.set('Could not delete the quote.'),
    });
  }
}

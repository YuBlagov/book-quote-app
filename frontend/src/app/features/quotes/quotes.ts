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
  isSubmitting = signal(false);

  // Error loading the list vs. error from an add/edit/delete action are kept as
  // separate signals: they used to share one `errorMessage`, which meant a failed
  // save/delete replaced the (already successfully loaded) quote list with just the
  // error text instead of showing it alongside the list.
  loadError = signal<string | null>(null);
  actionError = signal<string | null>(null);

  // Form state, shared between "add" and "edit" (editingId === null means "adding new").
  editingId = signal<number | null>(null);
  draft: QuoteInput = { text: '', author: '' };

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.quoteService.getAll().subscribe({
      next: (quotes) => {
        this.quotes.set(quotes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load quotes', err);
        this.loadError.set('Could not load quotes.');
        this.isLoading.set(false);
      },
    });
  }

  startEdit(quote: Quote): void {
    this.editingId.set(quote.id);
    this.actionError.set(null);
    this.draft = { text: quote.text, author: quote.author };
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.actionError.set(null);
    this.draft = { text: '', author: '' };
  }

  save(): void {
    const id = this.editingId();
    this.isSubmitting.set(true);
    this.actionError.set(null);

    if (id === null) {
      this.quoteService.create(this.draft).subscribe({
        next: (created) => {
          this.quotes.set([...this.quotes(), created]);
          this.draft = { text: '', author: '' };
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Failed to add quote', err);
          this.isSubmitting.set(false);
          this.actionError.set('Could not add the quote. Please try again.');
        },
      });
    } else {
      this.quoteService.update(id, this.draft).subscribe({
        next: () => {
          this.quotes.set(this.quotes().map((q) => (q.id === id ? { ...q, ...this.draft } : q)));
          this.isSubmitting.set(false);
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Failed to update quote', err);
          this.isSubmitting.set(false);
          this.actionError.set('Could not update the quote. Please try again.');
        },
      });
    }
  }

  remove(quote: Quote): void {
    if (!confirm('Delete this quote?')) return;

    this.actionError.set(null);
    this.quoteService.delete(quote.id).subscribe({
      next: () => this.quotes.set(this.quotes().filter((q) => q.id !== quote.id)),
      error: (err) => {
        console.error('Failed to delete quote', err);
        this.actionError.set('Could not delete the quote. Please try again.');
      },
    });
  }
}

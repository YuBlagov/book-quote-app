import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Book } from '../../../core/models/book.model';
import { BookService } from '../../../core/services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './book-list.html',
})
export class BookList implements OnInit {
  books = signal<Book[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.bookService.getAll().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load books', err);
        this.errorMessage.set('Could not load books.');
        this.isLoading.set(false);
      },
    });
  }

  remove(book: Book): void {
    if (!confirm(`Delete "${book.title}"?`)) return;

    this.bookService.delete(book.id).subscribe({
      next: () => this.books.set(this.books().filter((b) => b.id !== book.id)),
      error: (err) => {
        console.error('Failed to delete book', err);
        this.errorMessage.set('Could not delete the book.');
      },
    });
  }
}

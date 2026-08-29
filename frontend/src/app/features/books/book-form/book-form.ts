import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookInput } from '../../../core/models/book.model';
import { BookService } from '../../../core/services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './book-form.html',
})
export class BookForm implements OnInit {
  model: BookInput = { title: '', author: '', publishedDate: '' };
  isEditMode = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  private bookId: number | null = null;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookId = Number(idParam);
      this.isEditMode.set(true);
      this.bookService.getById(this.bookId).subscribe({
        next: (book) => {
          this.model = {
            title: book.title,
            author: book.author,
            publishedDate: book.publishedDate ? book.publishedDate.slice(0, 10) : '',
          };
        },
        error: (err) => {
          console.error('Failed to load book', err);
          this.errorMessage.set('Could not load the book.');
        },
      });
    }
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // publishedDate is optional: the <input type="date"> yields '' when left blank,
    // which the backend's DateTime? can't parse, so normalize it to null before sending.
    const payload = { ...this.model, publishedDate: this.model.publishedDate || null };

    const onError = (err: unknown) => {
      console.error('Failed to save book', err);
      this.isSubmitting.set(false);
      this.errorMessage.set('Could not save the book.');
    };
    const onSuccess = () => this.router.navigate(['/books']);

    if (this.isEditMode()) {
      this.bookService.update(this.bookId!, payload).subscribe({ next: onSuccess, error: onError });
    } else {
      this.bookService.create(payload).subscribe({ next: onSuccess, error: onError });
    }
  }
}

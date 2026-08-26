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
          this.model = { title: book.title, author: book.author, publishedDate: book.publishedDate.slice(0, 10) };
        },
        error: () => this.errorMessage.set('Could not load the book.'),
      });
    }
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const onError = () => {
      this.isSubmitting.set(false);
      this.errorMessage.set('Could not save the book.');
    };
    const onSuccess = () => this.router.navigate(['/books']);

    if (this.isEditMode()) {
      this.bookService.update(this.bookId!, this.model).subscribe({ next: onSuccess, error: onError });
    } else {
      this.bookService.create(this.model).subscribe({ next: onSuccess, error: onError });
    }
  }
}

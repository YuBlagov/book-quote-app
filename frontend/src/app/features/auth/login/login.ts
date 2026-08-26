import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  username = '';
  password = '';
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/books']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Invalid username or password.' : 'Login failed. Please try again.'
        );
      },
    });
  }
}

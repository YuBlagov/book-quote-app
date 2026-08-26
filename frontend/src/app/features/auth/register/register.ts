import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.errorMessage.set(null);

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.auth.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Account created! You can now log in.');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.status === 409 ? 'That username is already taken.' : 'Registration failed. Please try again.'
        );
      },
    });
  }
}

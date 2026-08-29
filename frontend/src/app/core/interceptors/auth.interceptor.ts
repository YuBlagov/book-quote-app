import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Render's free tier spins the backend down after ~15 min idle, and the first request
// after that can take 30-60s to wake it back up (see README). Give it plenty of room,
// but don't let a request hang forever with zero feedback if something is truly stuck.
const REQUEST_TIMEOUT_MS = 60_000;

// Attaches the JWT (if present) to every outgoing request as a Bearer token, and
// guarantees every request either resolves or surfaces a loud, logged error —
// no request should ever just hang silently with nothing in the console.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((err) => {
      if (err instanceof TimeoutError) {
        console.error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${req.method} ${req.url}`);
      }
      return throwError(() => err);
    })
  );
};

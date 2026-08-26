import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'books',
    loadComponent: () => import('./features/books/book-list/book-list').then((m) => m.BookList),
    canActivate: [authGuard],
  },
  {
    path: 'books/new',
    loadComponent: () => import('./features/books/book-form/book-form').then((m) => m.BookForm),
    canActivate: [authGuard],
  },
  {
    path: 'books/edit/:id',
    loadComponent: () => import('./features/books/book-form/book-form').then((m) => m.BookForm),
    canActivate: [authGuard],
  },
  {
    path: 'quotes',
    loadComponent: () => import('./features/quotes/quotes').then((m) => m.Quotes),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'books' },
];

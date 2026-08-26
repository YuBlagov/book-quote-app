import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // 'light' | 'dark'
  theme = signal<'light' | 'dark'>(this.readInitialTheme());

  constructor() {
    // Keep <html data-bs-theme="..."> and localStorage in sync whenever theme changes.
    effect(() => {
      const value = this.theme();
      document.documentElement.setAttribute('data-bs-theme', value);
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // localStorage may be unavailable (e.g. private mode) - ignore.
      }
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  private readInitialTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { Quote, QuoteInput } from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly baseUrl = `${API_BASE_URL}/quotes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.baseUrl);
  }

  create(quote: QuoteInput): Observable<Quote> {
    return this.http.post<Quote>(this.baseUrl, quote);
  }

  update(id: number, quote: QuoteInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, quote);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

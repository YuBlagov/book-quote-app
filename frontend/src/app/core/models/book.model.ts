export interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string | null; // ISO date string, e.g. "2024-05-01" — optional, may be null
}

export type BookInput = Omit<Book, 'id'>;

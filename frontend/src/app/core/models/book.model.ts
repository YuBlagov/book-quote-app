export interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string; // ISO date string, e.g. "2024-05-01"
}

export type BookInput = Omit<Book, 'id'>;

export interface Quote {
  id: number;
  text: string;
  author: string;
}

export type QuoteInput = Omit<Quote, 'id'>;

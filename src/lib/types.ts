export type Book = {
  id: string;
  code: string;
  name: string;
  quantity: number;
  description: string;
};

export type SaleStatus = 'sold' | 'reserved' | 'canceled' | 'pending';

export type Sale = {
  id: string;
  bookId: string;
  date: Date;
  status: SaleStatus;
  notes: string;
};

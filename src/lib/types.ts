export type Book = {
  id: string;
  code: string;
  name: string;
  coverImageUrl?: string;
};

export type SalePlatform = 'Avito' | 'Ozon';

export type SaleStatus =
  | 'in_process'
  | 'in_preparation'
  | 'shipped'
  | 'sold_in_person'
  | 'completed'
  | 'canceled';

export type Sale = {
  id: string;
  bookId: string;
  date: Date;
  status: SaleStatus;
  platform: SalePlatform;
  saleAmount?: number;
};

export type UserProfile = {
    username?: string;
    photoUrl?: string;
};

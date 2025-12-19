export type Book = {
  id: string;
  code: string;
  name: string;
  coverImageUrl?: string;
  userId?: string;
};

export type SalePlatform = 'Avito' | 'Ozon';

export const SALE_STATUSES = [
  'in_process',
  'in_preparation',
  'shipped',
  'sold_in_person',
  'completed',
  'canceled',
] as const;

export type SaleStatus = (typeof SALE_STATUSES)[number];

export type Sale = {
  id: string;
  bookId: string;
  userId?: string;
  date: Date;
  status: SaleStatus;
  platform: SalePlatform;
  saleAmount?: number;
};

export type UserProfile = {
    username?: string;
    photoUrl?: string;
    updatedAt?: any;
};

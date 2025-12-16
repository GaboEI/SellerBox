'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Book, Sale } from '@/lib/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday } from 'date-fns';
import { useState, useEffect } from 'react';


interface RecentSalesProps {
  sales: Sale[];
  books: Book[];
}

export function RecentSales({ sales, books }: RecentSalesProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (date: Date) => {
    if (!isClient) return '';
    if (isToday(date)) return t('today');
    if (isYesterday(date)) return t('yesterday');
    return format(date, 'dd.MM.yy');
  };

  const recentSales = sales
    .filter((s) => s.status === 'completed' || s.status === 'sold_in_person')
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  const bookMap = new Map(books.map(b => [b.id, b]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isClient ? t('recent_sales') : 'Recent Sales'}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentSales.map((sale) => {
          const book = bookMap.get(sale.bookId);
          if (!book) return null;
          
          const fallback = book.name.substring(0, 2).toUpperCase();

          const formattedAmount = sale.saleAmount
            ? `+ ${new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(sale.saleAmount)}`
            : '-';

          return (
            <div className="flex items-center gap-4" key={sale.id}>
              <Avatar className="hidden h-9 w-9 sm:flex">
                {book.coverImageUrl ? (
                  <Image src={book.coverImageUrl} alt="Book cover" className="aspect-square h-full w-full" width={36} height={36} />
                ) : (
                  <AvatarFallback>?</AvatarFallback>
                )}
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{book.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(sale.date)}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {formattedAmount}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

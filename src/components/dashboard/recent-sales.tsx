'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Book, Sale } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useI18n } from '../i18n/i18n-provider';

interface RecentSalesProps {
  sales: Sale[];
  books: Book[];
}

export function RecentSales({ sales, books }: RecentSalesProps) {
  const { t } = useI18n();
  const recentSales = sales
    .filter((s) => s.status === 'completed' || s.status === 'sold_in_person')
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  const bookMap = new Map(books.map(b => [b.id, b]));
  const coverMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));
  
  // A simple mapping from book name to placeholder id
  const bookToCoverId: {[key: string]: string} = {
    'The C++ Programming Language': 'cover_cpp',
    'Clean Code: A Handbook of Agile Software Craftsmanship': 'cover_clean_code',
    'Design Patterns: Elements of Reusable Object-Oriented Software': 'cover_design_patterns',
    'JavaScript: The Good Parts': 'cover_js_good_parts',
    'You Don\'t Know JS: Up & Going': 'cover_ydkjs',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recent_sales')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentSales.map((sale) => {
          const book = bookMap.get(sale.bookId);
          if (!book) return null;
          
          const coverId = bookToCoverId[book.name];
          const coverUrl = coverMap.get(coverId) || "https://picsum.photos/seed/book/100/100";
          const fallback = book.name.substring(0, 2).toUpperCase();

          return (
            <div className="flex items-center gap-4" key={sale.id}>
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={coverUrl} alt="Book cover" data-ai-hint="book cover" />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{book.name}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.date.toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {`+ ${sale.saleAmount?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0}) || '-'}`}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

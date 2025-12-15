'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, Package, ShoppingBag } from 'lucide-react';
import type { Book as BookType, Sale } from '@/lib/types';
import { useI18n } from '../i18n/i18n-provider';

interface StatsCardsProps {
  sales: Sale[];
  books: BookType[];
}

export function StatsCards({ sales, books }: StatsCardsProps) {
  const { t } = useI18n();
  const soldSales = sales.filter((s) => s.status === 'completed' || s.status === 'sold_in_person');
  const totalSales = soldSales.length;
  const totalRevenue = soldSales.reduce((sum, sale) => sum + (sale.saleAmount || 0), 0);
  const totalBooks = books.length;

  const stats = [
    {
      title: t('total_revenue'),
      value: `${totalRevenue.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      icon: (
        <svg
          className="h-4 w-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8.5 17.5h7" />
          <path d="M15.5 7.5h-7" />
          <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
        </svg>
      ),
      description: t('total_revenue_desc'),
    },
    {
      title: t('sales_title'),
      value: `+${totalSales}`,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
      description: t('sales_desc'),
    },
    {
      title: t('books_in_catalog'),
      value: `${totalBooks}`,
      icon: <Book className="h-4 w-4 text-muted-foreground" />,
      description: t('books_in_catalog_desc'),
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

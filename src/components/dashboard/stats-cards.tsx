import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, DollarSign, Package, ShoppingBag } from 'lucide-react';
import type { Book as BookType, Sale } from '@/lib/types';

interface StatsCardsProps {
  sales: Sale[];
  books: BookType[];
}

export function StatsCards({ sales, books }: StatsCardsProps) {
  const totalSales = sales.filter((s) => s.status === 'sold').length;
  // Dummy revenue, as we don't have price data
  const totalRevenue = totalSales * 29.99;
  const totalBooks = books.length;
  const totalStock = books.reduce((sum, book) => sum + book.quantity, 0);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: 'Total revenue from sales',
    },
    {
      title: 'Sales',
      value: `+${totalSales}`,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
      description: 'Total books sold',
    },
    {
      title: 'Books in Catalog',
      value: `${totalBooks}`,
      icon: <Book className="h-4 w-4 text-muted-foreground" />,
      description: 'Unique titles in your catalog',
    },
    {
      title: 'Total Stock',
      value: `${totalStock}`,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: 'Total number of items in inventory',
    },
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

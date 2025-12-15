'use client';

import React from 'react';
import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';
import type { Book, Sale } from '@/lib/types';

export default function SalesPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
    fetchData();
  }, []);

  return <SalesClient sales={sales} books={books} />;
}

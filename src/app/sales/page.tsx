'use client';

import React from 'react';
import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';
import type { Book, Sale } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';


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

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="p-4 lg:p-6">
                <SalesClient sales={sales} books={books} />
            </main>
        </SidebarInset>
    </SidebarProvider>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';
import type { Book, Sale } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';


export default function SalesPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);
  const [clientKey, setClientKey] = useState(Date.now().toString());


  const handleDataChange = React.useCallback(() => {
    setClientKey(Date.now().toString());
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
    fetchData();
  }, [clientKey]);

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="p-4 lg:p-6">
                <SalesClient sales={sales} books={books} onDataChange={handleDataChange} />
            </main>
        </SidebarInset>
    </SidebarProvider>
    );
}

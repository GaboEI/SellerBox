'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';
import type { Book, Sale } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useTranslation } from 'react-i18next';


export default function SalesPage() {
  const { t } = useTranslation();
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [clientKey, setClientKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = useCallback(async () => {
    const salesData = await getSales();
    const booksData = await getBooks();
    setSales(salesData);
    setBooks(booksData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, clientKey]);
  
  const handleDataChange = useCallback(() => {
    setClientKey(prevKey => prevKey + 1);
  }, []);

  const handleSaleDeleted = useCallback((deletedSaleId: string) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== deletedSaleId));
  }, []);

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="p-4 lg:p-6">
                <SalesClient 
                    sales={sales} 
                    books={books} 
                    onDataChange={handleDataChange} 
                    onSaleDeleted={handleSaleDeleted} 
                />
            </main>
        </SidebarInset>
    </SidebarProvider>
    );
}

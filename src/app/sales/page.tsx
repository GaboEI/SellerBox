'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getSales, getBooks } from '@/lib/actions';
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
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = useCallback(async () => {
    if (session) { // Solo busca datos si hay una sesión
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('sb:sales-refresh', handleRefresh);
    return () => window.removeEventListener('sb:sales-refresh', handleRefresh);
  }, [fetchData]);

  if (status === 'loading') {
    return <div>{t('loading')}</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="p-4 lg:p-6">
                <SalesClient 
                    sales={sales} 
                    books={books} 
                />
            </main>
        </SidebarInset>
    </SidebarProvider>
    );
}

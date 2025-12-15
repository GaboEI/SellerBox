'use client';

import React, { useEffect } from 'react';
import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';
import type { Book, Sale } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';


export default function SalesPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
    fetchData();
  }, [user]);

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }


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

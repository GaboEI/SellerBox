'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getBooks } from '@/lib/actions';
import { CatalogClient } from '@/components/catalog/catalog-client';
import type { Book } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useTranslation } from 'react-i18next';

export default function InventoryPage() {
  const { t } = useTranslation();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBooks = useCallback(async () => {
    if (session) { // Solo busca libros si hay una sesión
      const booksData = await getBooks();
      setBooks(booksData);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBooks();
    }
  }, [status, fetchBooks]);

  if (status === 'loading') {
    return <div>{t('loading')}</div>; // O un componente de carga más elaborado
  }

  if (status === 'unauthenticated') {
    redirect('/login');
    return null; // Asegura que no se renderice nada más mientras redirige
  }

  const handleBookDeleted = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  };
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <CatalogClient books={books} onBookDeleted={handleBookDeleted} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

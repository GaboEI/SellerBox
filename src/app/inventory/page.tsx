'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { PageHeader } from '@/components/shared/page-header';
import type { Book } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useTranslation } from 'react-i18next';

export default function InventoryPage() {
  const { t } = useTranslation();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBooks = useCallback(async () => {
    const booksData = await getBooks();
    setBooks(booksData);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
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

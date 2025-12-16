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

  const handleBookDeleted = useCallback((deletedBookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== deletedBookId));
  }, []);

  const handleDataChange = useCallback(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
              <PageHeader title={isClient ? t('warehouse') : 'Warehouse'} description={isClient ? t('view_manage_stock') : 'View and manage your book stock.'} />
              <CatalogClient books={books} onDataChange={handleDataChange} onBookDeleted={handleBookDeleted} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

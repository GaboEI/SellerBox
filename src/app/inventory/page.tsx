'use client';

import React, { useState, useEffect } from 'react';
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
  const [clientKey, setClientKey] = React.useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    async function fetchBooks() {
      const booksData = await getBooks();
      setBooks(booksData);
    }
    fetchBooks();
  }, [clientKey]);

  const handleDataChange = React.useCallback(() => {
    setClientKey(prevKey => prevKey + 1);
  }, []);
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
              <PageHeader title={isClient ? t('warehouse') : 'Warehouse'} description={isClient ? t('view_manage_stock') : 'View and manage your book stock.'} />
              <CatalogClient books={books} onDataChange={handleDataChange} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
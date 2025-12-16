'use client';

import React from 'react';
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
  const [clientKey, setClientKey] = React.useState(Date.now().toString());

  React.useEffect(() => {
    async function fetchBooks() {
      const booksData = await getBooks();
      setBooks(booksData);
    }
    fetchBooks();
  }, [clientKey]);

  const handleDataChange = React.useCallback(() => {
    setClientKey(Date.now().toString());
  }, []);
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
              <PageHeader title={t('warehouse')} description={t('view_manage_stock')} />
              <CatalogClient books={books} onDataChange={handleDataChange} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

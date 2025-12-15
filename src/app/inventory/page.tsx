'use client';

import React, { useEffect } from 'react';
import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { PageHeader } from '@/components/shared/page-header';
import type { Book } from '@/lib/types';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';


export default function InventoryPage() {
  const { t } = useI18n();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [clientKey, setClientKey] = React.useState(Date.now().toString());
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    async function fetchBooks() {
      const booksData = await getBooks();
      setBooks(booksData);
    }
    fetchBooks();
  }, [clientKey, user]);

  const handleDataChange = React.useCallback(() => {
    setClientKey(Date.now().toString());
  }, []);
  
  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
              <PageHeader title={t('warehouse')} description={t('warehouse_desc')} />
              <CatalogClient books={books} onDataChange={handleDataChange} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

'use client';

import React from 'react';
import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { PageHeader } from '@/components/shared/page-header';
import type { Book } from '@/lib/types';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function InventoryPage() {
  const { t } = useI18n();
  const [books, setBooks] = React.useState<Book[]>([]);

  React.useEffect(() => {
    async function fetchBooks() {
      const booksData = await getBooks();
      setBooks(booksData);
    }
    fetchBooks();
  }, []);


  return (
    <div className="flex flex-col gap-8">
        <PageHeader title={t('inventory')} description={t('inventory_desc')} />
        <CatalogClient books={books} />
    </div>
  )
}

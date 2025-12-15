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


  // This key forces a re-render when a book is added/updated,
  // ensuring the list stays in sync.
  const clientKey = books.map(b => b.id + b.quantity).join(',');

  return (
    <div className="flex flex-col gap-8">
        <PageHeader title={t('inventory')} description={t('inventory_desc')} />
        <CatalogClient books={books} key={clientKey} />
    </div>
  )
}

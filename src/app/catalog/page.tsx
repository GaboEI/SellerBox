'use client';

import React from 'react';
import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';
import type { Book } from '@/lib/types';

export default function CatalogPage() {
  const [books, setBooks] = React.useState<Book[]>([]);

  React.useEffect(() => {
    async function fetchBooks() {
      const booksData = await getBooks();
      setBooks(booksData);
    }
    fetchBooks();
  }, []);

  return <CatalogClient books={books} />;
}

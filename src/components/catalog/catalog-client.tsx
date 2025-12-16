'use client';
import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import type { Book as BookType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function CatalogClient({ books }: { books: BookType[]}) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [filter, setFilter] = React.useState('');
  
  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );
  
  const tableColumns = React.useMemo(() => getColumns(isClient, t), [isClient, t]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isClient ? t('master_catalog') : 'Master Catalog'}
        description={isClient ? t('manage_book_collection') : 'Manage your complete book collection.'}
      >
        <Button size="sm" className="gap-1" asChild>
          <Link href="/inventory/add">
            <PlusCircle className="h-4 w-4" />
            {isClient ? t('add_book') : 'Add Book'}
          </Link>
        </Button>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={isClient ? t('filter_by_name_or_code') : 'Filter by name or code...'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={tableColumns} data={filteredBooks} isClient={isClient} />
      </Card>
    </div>
  );
}

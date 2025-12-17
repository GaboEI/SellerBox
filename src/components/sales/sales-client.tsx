'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns, SaleWithBookData } from './columns';
import type { Book, Sale } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function SalesClient({ sales, books }: { sales: Sale[], books: Book[] }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [filter, setFilter] = React.useState('');
  
  const bookMap = React.useMemo(() => new Map(books.map(b => [b.id, b])), [books]);
  
  const tableColumns = React.useMemo(() => getColumns(isClient, t), [isClient, t]);

  const salesWithBookData = React.useMemo(() => {
    return sales.map(sale => {
        const book = bookMap.get(sale.bookId);
        return {
            ...sale,
            bookName: book?.name || 'Unknown Book',
            coverImageUrl: book?.coverImageUrl
        }
    }).filter(
        (sale) => {
            return sale.bookName.toLowerCase().includes(filter.toLowerCase()) ||
                   sale.status.toLowerCase().includes(filter.toLowerCase()) ||
                    sale.platform.toLowerCase().includes(filter.toLowerCase())
        }
      );
  }, [sales, bookMap, filter]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isClient ? t('sales_records') : 'Sales Records'}
        description={isClient ? t('view_manage_sales') : 'View and manage all your sales transactions.'}
      >
        <Button size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href="/sales/add">
            <Plus className="h-4 w-4" />
            <span className="sr-only">{isClient ? t('record_sale') : 'Record Sale'}</span>
          </Link>
        </Button>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={isClient ? t('filter_sales') : 'Filter by book, status, or platform...'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={tableColumns} data={salesWithBookData} isClient={isClient} />
      </Card>
    </div>
  );
}

'use client';
import React, { useEffect, useState, useMemo } from 'react';
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
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type PaginationState,
  type ColumnDef,
} from '@tanstack/react-table';

export function SalesClient({
  sales: initialSales,
  books,
}: {
  sales: Sale[];
  books: Book[];
}) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [filter, setFilter] = React.useState('');
  const [sales, setSales] = useState<Sale[]>(initialSales);

  useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  const handleSaleUpdate = (saleId: string, updatedData: Partial<Sale>) => {
    setSales(currentSales => 
        currentSales.map(sale => 
            sale.id === saleId ? { ...sale, ...updatedData } : sale
        )
    );
  };
  const handleSaleDelete = (saleId: string) => {
    setSales(currentSales => currentSales.filter(sale => sale.id !== saleId));
  };


  const bookMap = React.useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books]
  );

  const salesWithBookData = useMemo(() => {
    return sales
      .map((sale) => {
        const book = bookMap.get(sale.bookId);
        return {
          ...sale,
          bookName: book?.name || t('unknown_book'),
          bookCode: book?.code,
          coverImageUrl: book?.coverImageUrl,
        };
      })
      .filter((sale) => {
        return (
          sale.bookName.toLowerCase().includes(filter.toLowerCase()) ||
          sale.status.toLowerCase().includes(filter.toLowerCase()) ||
          (sale.platform && sale.platform.toLowerCase().includes(filter.toLowerCase()))
        );
      });
  }, [sales, bookMap, filter, t]);

  const tableColumns = React.useMemo(
    () => getColumns(isClient, t, handleSaleUpdate, handleSaleDelete),
    [isClient, t]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  });

  const table = useReactTable({
    data: salesWithBookData,
    columns: tableColumns as ColumnDef<SaleWithBookData, any>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    meta: {
        updateData: (rowIndex: number, columnId: string, value: unknown) => {
            setSales(old =>
                old.map((row, index) => {
                    if (index === rowIndex) {
                        return {
                            ...old[rowIndex],
                            [columnId]: value,
                        };
                    }
                    return row;
                })
            );
        },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('sales_records')}
        description={
          isClient
            ? t('view_manage_sales')
            : 'View and manage all your sales transactions.'
        }
      >
        <Button size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href="/sales/add">
            <Plus className="h-4 w-4" />
            <span className="sr-only">
              {t('record_sale')}
            </span>
          </Link>
        </Button>
      </PageHeader>
      <Card className="p-2 sm:p-4">
        <div className="mb-2">
          <Input
            placeholder={
              isClient
                ? t('filter_sales')
                : 'Filter by book, status, or platform...'
            }
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={tableColumns} table={table} isClient={isClient} />
      </Card>
    </div>
  );
}

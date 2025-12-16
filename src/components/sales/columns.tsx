'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit } from 'lucide-react';
import type { Sale, SaleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { TFunction } from 'i18next';
import { format, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';

export type SaleWithBookData = Sale & { bookName: string, coverImageUrl?: string };

const statusVariantMap: Record<SaleStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  in_process: 'warning',
  in_preparation: 'secondary',
  shipped: 'outline',
  sold_in_person: 'success',
  completed: 'default',
  canceled: 'destructive',
};

function CellActions({ row, isClient, t, onEdit, onDelete }: { row: any, isClient: boolean, t: TFunction, onEdit: (sale: SaleWithBookData) => void, onDelete: (sale: SaleWithBookData) => void }) {
  const sale = row.original as SaleWithBookData;
  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  return (
    <>
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Edit className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(sale)}>{isClient ? t('edit_sale') : 'Edit Sale'}</DropdownMenuItem>
          {!isFinalState && <DropdownMenuSeparator />}
          {!isFinalState && <DropdownMenuItem onClick={() => onDelete(sale)} className="text-destructive focus:text-destructive">{isClient ? t('delete_sale') : 'Delete Sale'}</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    </>
  );
}

const formatDate = (date: Date, t: TFunction, isClient: boolean) => {
    if (!isClient) return '';
    if (isToday(date)) return t('today');
    if (isYesterday(date)) return t('yesterday');
    return format(date, 'dd.MM.yy');
};

export const getColumns = (isClient: boolean, t: TFunction, onEdit: (sale: SaleWithBookData) => void, onDelete: (sale: SaleWithBookData) => void): ColumnDef<SaleWithBookData>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: () => <div className="text-center">{isClient ? t('photo') : 'Photo'}</div>,
    cell: ({ row }) => {
      const { bookName, coverImageUrl } = row.original;
      return (
        <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-sm border bg-muted text-lg font-bold text-muted-foreground">
          {coverImageUrl ? (
            <Image 
              src={coverImageUrl}
              alt={bookName}
              width={36}
              height={48}
              className="h-full w-full rounded-sm object-cover"
            />
          ) : (
            <span>?</span>
          )}
        </div>
      )
    },
    size: 60,
  },
  {
    accessorKey: 'bookName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {isClient ? t('book_name') : 'Book Name'}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('bookName')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="w-full justify-center">
                {isClient ? t('date') : 'Date'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div className="text-center font-medium">{formatDate(date, t, isClient)}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: () => <div className="text-center">{isClient ? t('status') : 'Status'}</div>,
    cell: ({ row }) => {
        const status = row.getValue('status') as SaleStatus;
        return (
          <div className="flex justify-center">
            <Badge variant={statusVariantMap[status]} className={cn('flex w-28 justify-center capitalize')}>
              {isClient ? t(status) : status}
            </Badge>
          </div>
        );
      },
  },
  {
    accessorKey: 'platform',
    header: () => <div className="text-center">{isClient ? t('platform') : 'Platform'}</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue('platform') as string}</div>
  },
  {
    accessorKey: 'saleAmount',
    header: () => <div className="w-full text-center">{isClient ? t('sale_amount_header') : '₽'}</div>,
    cell: ({ row }) => {
      const amount = row.getValue('saleAmount') as number | undefined;
      if (amount === undefined || amount === null) {
        return <div className="text-center">-</div>;
      }
      const formattedAmount = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
      return <div className="text-right font-medium">{formattedAmount}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions row={row} isClient={isClient} t={t} onEdit={onEdit} onDelete={onDelete} />,
  },
];

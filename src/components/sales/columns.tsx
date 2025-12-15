'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sale, SaleStatus } from '@/lib/types';
import { useI18n } from '../i18n/i18n-provider';

type SaleWithBookName = Sale & { bookName: string };

const statusVariantMap: Record<SaleStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    sold: 'default',
    reserved: 'outline',
    pending: 'secondary',
    canceled: 'destructive'
}

export const columns: ColumnDef<SaleWithBookName>[] = [
  {
    accessorKey: 'bookName',
    header: ({ column }) => {
        const { t } = useI18n();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('book_name')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('bookName')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
        const { t } = useI18n();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('date')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        const formatted = date.toLocaleDateString();
        return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: function CellHeader() {
        const { t } = useI18n();
        return t('status');
    },
    cell: ({ row }) => {
        const { t } = useI18n();
        const status = row.getValue('status') as SaleStatus;
        return <Badge variant={statusVariantMap[status]} className="capitalize">{t(status)}</Badge>;
    }
  },
  {
    accessorKey: 'notes',
    header: function CellHeader() {
        const { t } = useI18n();
        return t('notes');
    },
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('notes') as string}</div>
  },
];

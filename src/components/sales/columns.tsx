'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sale, SaleStatus } from '@/lib/types';

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
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Book Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('bookName')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
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
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as SaleStatus;
        return <Badge variant={statusVariantMap[status]} className="capitalize">{status}</Badge>;
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('notes') as string}</div>
  },
];

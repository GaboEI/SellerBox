'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TFunction } from 'i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Book } from '@/lib/types';

const CellActions: React.FC<{
  row: any;
  t: TFunction;
  onDelete: (book: Book) => void;
}> = ({ row, t, onDelete }) => {
  const book = row.original as Book;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(book.code)}
          >
            {t('copy_code')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/inventory/edit/${book.id}`}>{t('edit_book')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(book)}>
            <span className="text-destructive">{t('delete_book')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const getColumns = (
  t: TFunction,
  onDelete: (book: Book) => void,
  isClient: boolean
): ColumnDef<Book>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: () => (
      <div className="text-center">{isClient ? t('photo') : 'Photo'}</div>
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue('coverImageUrl') as string | undefined;
      return (
        <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-sm border bg-muted text-lg font-bold text-muted-foreground">
          {imageUrl && imageUrl !== '?' ? (
            <Image
              src={imageUrl}
              alt={row.original.name}
              width={36}
              height={48}
              className="h-full w-full rounded-sm object-cover"
            />
          ) : (
            <span>?</span>
          )}
        </div>
      );
    },
    size: 60,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="p-0"
      >
        {isClient ? t('code_header') : 'Code'}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="p-0"
      >
        {isClient ? t('name_header') : 'Name'}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">{isClient ? t('actions') : 'Actions'}</div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CellActions row={row} t={t} onDelete={onDelete} />
      </div>
    ),
    size: 60,
  },
];
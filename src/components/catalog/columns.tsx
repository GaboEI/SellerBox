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
  row: any,
  isClient: boolean,
  t: TFunction
}> = ({ row, isClient, t }) => {
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
          <DropdownMenuLabel>{isClient ? t('actions') : 'Actions'}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(book.code)}>
            {isClient ? t('copy_code') : 'Copy Code'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/inventory/edit/${book.id}`}>{isClient ? t('edit_book') : 'Edit Book'}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const getColumns = (isClient: boolean, t: TFunction): ColumnDef<Book>[] => [
    {
      accessorKey: 'coverImageUrl',
      header: isClient ? t('cover_photo_header') : 'COVER PHOTO',
      cell: ({ row }) => {
        const imageUrl = row.getValue('coverImageUrl') as string | undefined;
        return (
          <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-2xl font-bold text-muted-foreground">
            {imageUrl && imageUrl !== '?' ? (
              <Image 
                src={imageUrl}
                alt={row.original.name}
                width={48}
                height={64}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <span>?</span>
            )}
          </div>
        )
      },
      size: 80,
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
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellActions row={row} isClient={isClient} t={t} />,
      size: 60,
    },
  ];

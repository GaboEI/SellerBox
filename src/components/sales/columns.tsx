'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import type { Sale, SaleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TFunction } from 'i18next';
import { format, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CellStatusEditable } from './cell-status-editable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { deleteSale } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export type SaleWithBookData = Sale & { bookName: string; coverImageUrl?: string };

const statusVariantMap: Record<
  SaleStatus,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  in_process: 'warning',
  in_preparation: 'secondary',
  shipped: 'outline',
  sold_in_person: 'success',
  completed: 'default',
  canceled: 'destructive',
};

function CellActions({
  row,
  isClient,
  t,
}: {
  row: any;
  isClient: boolean;
  t: TFunction;
}) {
  const sale = row.original as SaleWithBookData;
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [masterKey, setMasterKey] = React.useState('');
  const [keyError, setKeyError] = React.useState('');

  const handleConfirmDelete = async () => {
    if (masterKey !== 'SellerBox@dmin2025') {
      setKeyError(t('incorrect_master_key'));
      return;
    }

    setKeyError('');
    const result = await deleteSale(sale.id);
    if (result && result.message) {
      toast({
        title: t('error'),
        description: t(result.message),
        variant: 'destructive',
      });
      return;
    }

    setOpen(false);
    setMasterKey('');
    toast({ title: t('success'), description: t('delete_sale_success') });
    router.refresh();
  };

  return (
    <div className="flex justify-end">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/80"
            title={t('delete_sale')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_sale')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('master_key_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('master_key')}</label>
            <Input
              value={masterKey}
              onChange={(event) => setMasterKey(event.target.value)}
              placeholder={t('master_key')}
            />
            {keyError && (
              <p className="text-sm text-destructive">{keyError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKeyError('')}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const formatDate = (date: Date, t: TFunction, isClient: boolean) => {
  if (!isClient) return '';
  if (isToday(date)) return t('today');
  if (isYesterday(date)) return t('yesterday');
  return format(date, 'dd.MM.yy');
};

export const getColumns = (
  isClient: boolean,
  t: TFunction,
  onSaleUpdate: (saleId: string, updatedData: Partial<Sale>) => void
): ColumnDef<SaleWithBookData>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: () => (
      <div className="text-center font-semibold text-gray-600">
        {t('photo')}
      </div>
    ),
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
      );
    },
    size: 60,
  },
  {
    accessorKey: 'bookName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="w-full justify-start text-left p-0 font-semibold text-gray-600 hover:text-gray-600"
      >
        {t('product_name')}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('bookName')}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="w-full justify-center text-center font-semibold text-gray-600 hover:text-gray-600"
      >
        {t('date')}
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return (
        <div className="text-center font-medium">
          {formatDate(date, t, isClient)}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className="text-center font-semibold text-gray-600">
        {t('status')}
      </div>
    ),
    cell: ({ row }) => {
        const sale = row.original;
        return (
          <CellStatusEditable
            sale={sale}
            isClient={isClient}
            t={t}
            onSaleUpdate={onSaleUpdate}
            statusVariantMap={statusVariantMap}
          />
        );
      },
  },
  {
    accessorKey: 'platform',
    header: () => (
      <div className="text-left font-semibold text-gray-600">
        {t('platform')}
      </div>
    ),
    cell: ({ row }) => {
      const platform = row.getValue('platform') as string;
      const logoSrc =
        platform === 'Avito'
          ? '/avito_logo.png'
          : platform === 'Ozon'
          ? '/ozon_logo.png'
          : '/sellerbox_icon.png';

      return (
        <div className="flex items-center justify-start gap-2">
          <Image
            src={logoSrc}
            alt={platform}
            width={16}
            height={16}
            className="h-4 w-4 rounded-sm object-contain"
          />
          <span>{platform}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'saleAmount',
    header: () => (
      <div className="w-full text-center font-semibold text-gray-600">
        {t('sale_amount_header')}
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue('saleAmount') as number | undefined;
      if (amount === undefined || amount === null) {
        return <div className="text-center">-</div>;
      }
      const formattedAmount = new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
      }).format(amount);
      return (
        <div className="text-center font-bold text-[#0b7426]">
          {formattedAmount} ₽
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right font-semibold text-gray-600">
        {t('actions')}
      </div>
    ),
    cell: ({ row }) => (
      <CellActions
        row={row}
        isClient={isClient}
        t={t}
      />
    ),
  },
];

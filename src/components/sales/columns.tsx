'use client';

import React, { useEffect, useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import type { Sale, SaleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSale, deleteSale } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TFunction } from 'i18next';
import { format, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type SaleWithBookData = Sale & { bookName: string, coverImageUrl?: string };

const statusVariantMap: Record<SaleStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  in_process: 'warning',
  in_preparation: 'secondary',
  shipped: 'outline',
  sold_in_person: 'success',
  completed: 'default',
  canceled: 'destructive',
};


function SubmitButton({ isClient, t }: { isClient: boolean, t: TFunction}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('saving') : t('save_changes')) : 'Save Changes' }
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
};


function EditSaleForm({ sale, setOpen, isClient, t }: { sale: SaleWithBookData; setOpen: (open: boolean) => void, isClient: boolean, t: TFunction }) {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = React.useState<SaleStatus>(sale.status);

  const updateSaleWithId = updateSale.bind(null, sale.id);
  const [state, formAction] = useFormState(updateSaleWithId, initialState);


  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  useEffect(() => {
    if (state?.message) {
        if (state.errors && Object.keys(state.errors).length > 0) {
            toast({ title: isClient ? t('error') : 'Error', description: state.message, variant: 'destructive' });
        } else {
            toast({ title: isClient ? t('success') : 'Success', description: isClient ? t('update_sale_success') : 'Sale updated successfully.' });
            setOpen(false);
            router.refresh();
        }
    }
  }, [state, toast, isClient, t, setOpen, router]);

  const showSaleAmount = currentStatus === 'completed' || currentStatus === 'sold_in_person';

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">{isClient ? t('status') : 'Status'}</Label>
        <Select name="status" defaultValue={sale.status} onValueChange={(value) => setCurrentStatus(value as SaleStatus)} disabled={isFinalState}>
          <SelectTrigger>
            <SelectValue placeholder={isClient ? t('select_status') : 'Select a status'} />
          </SelectTrigger>
          <SelectContent>
            {(['in_process', 'in_preparation', 'shipped', 'sold_in_person', 'completed', 'canceled'] as SaleStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {isClient ? t(status) : status}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {showSaleAmount && (
        <div className="space-y-2">
          <Label htmlFor="saleAmount">{isClient ? t('sale_amount_header') : 'Sale Amount'}</Label>
          <div className="relative">
            <Input id="saleAmount" name="saleAmount" type="number" step="1" placeholder="2499" defaultValue={sale.saleAmount} required />
            <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">₽</span>
          </div>
        </div>
      )}
      
      {!isFinalState && <SubmitButton isClient={isClient} t={t} />}
    </form>
  );
}


function CellActions({ row, isClient, t }: { row: any, isClient: boolean, t: TFunction }) {
  const sale = row.original as SaleWithBookData;
  const { toast } = useToast();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  const handleDelete = async () => {
    try {
        const result = await deleteSale(sale.id);
        if (result.message.includes('success')) {
            toast({ title: t('success'), description: t('delete_sale_success') });
            router.refresh();
        } else {
            toast({ title: t('error'), description: result.message, variant: 'destructive' });
        }
    } catch(e) {
        toast({ title: t('error'), description: t('failed_to_delete_sale'), variant: 'destructive' });
    }
  }


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
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>{isClient ? t('edit_sale') : 'Edit Sale'}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">{isClient ? t('delete_sale') : 'Delete Sale'}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isClient ? t('update_sale_status') : 'Update Sale Status'}</DialogTitle>
            <DialogDescription>
              {isFinalState ? (isClient ? t('update_sale_final_desc') : 'This sale is in a final state and cannot be modified.') : (isClient ? t('update_sale_desc') : 'Change the status of the sale.')}
            </DialogDescription>
          </DialogHeader>
          <EditSaleForm sale={sale} setOpen={setIsEditDialogOpen} isClient={isClient} t={t} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{isClient ? t('are_you_sure_delete') : 'Are you absolutely sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {isClient ? t('delete_sale_warning_simple') : 'This will permanently delete the sale record.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{isClient ? t('cancel') : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{isClient ? t('delete') : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const formatDate = (date: Date, t: TFunction, isClient: boolean) => {
    if (!isClient) return '';
    if (isToday(date)) return t('today');
    if (isYesterday(date)) return t('yesterday');
    return format(date, 'dd.MM.yy');
};

export const columns = (isClient: boolean, t: TFunction): ColumnDef<SaleWithBookData>[] => [
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
    cell: ({ row }) => <CellActions row={row} isClient={isClient} t={t} />,
  },
];

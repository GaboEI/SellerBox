'use client';

import React, { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit } from 'lucide-react';
import type { Sale, SaleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSale } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TFunction } from 'i18next';


type SaleWithBookName = Sale & { bookName: string };

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

function EditSaleForm({ sale, setOpen, isClient, t }: { sale: SaleWithBookName; setOpen: (open: boolean) => void, isClient: boolean, t: TFunction }) {
  const [state, formAction] = useActionState(updateSale.bind(null, sale.id), { message: '', errors: {} });
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = React.useState<SaleStatus>(sale.status);

  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  React.useEffect(() => {
    if (state.message?.includes('success')) {
      toast({ title: isClient ? t('success') : 'Success', description: isClient ? t('update_sale_success') : 'Sale updated successfully.' });
      setOpen(false);
    } else if (state.message) {
      toast({ title: isClient ? t('error') : 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, setOpen, t, isClient]);

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
          <Label htmlFor="saleAmount">{isClient ? t('sale_amount') : 'Sale Amount'}</Label>
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
  const sale = row.original as SaleWithBookName;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';


  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className='h-8 w-8'>
        <Edit className="h-4 w-4" />
        <span className="sr-only">{isClient ? t('edit_sale') : 'Edit Sale'}</span>
      </Button>

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
    </>
  );
}

export const columns = (isClient: boolean, t: TFunction): ColumnDef<SaleWithBookName>[] => [
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
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {isClient ? t('date') : 'Date'}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      const formatted = date.toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: isClient ? t('status') : 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as SaleStatus;
      return <Badge variant={statusVariantMap[status]} className={cn('capitalize')}>{isClient ? t(status) : status}</Badge>;
    },
  },
  {
    accessorKey: 'platform',
    header: isClient ? t('platform') : 'Platform',
    cell: ({ row }) => <div>{row.getValue('platform') as string}</div>
  },
  {
    accessorKey: 'saleAmount',
    header: isClient ? t('sale_amount') : 'Sale Amount',
    cell: ({ row }) => {
        const amount = row.getValue('saleAmount') as number | undefined;
        if (amount === undefined || amount === null) {
            return <div className="text-center">-</div>;
        }
        return <div className="text-right font-medium">{amount.toLocaleString('ru-RU')} ₽</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <div className="text-center"><CellActions row={row} isClient={isClient} t={t} /></div>,
  },
];

'use client';

import React from 'react';
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

type SaleWithBookName = Sale & { bookName: string };

const statusVariantMap: Record<SaleStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  in_process: 'warning',
  in_preparation: 'secondary',
  shipped: 'outline',
  sold_in_person: 'success',
  completed: 'default',
  canceled: 'destructive',
};


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

function EditSaleForm({ sale, setOpen }: { sale: SaleWithBookName; setOpen: (open: boolean) => void }) {
  const [state, formAction] = useActionState(updateSale.bind(null, sale.id), { message: '', errors: {} });
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = React.useState<SaleStatus>(sale.status);

  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  React.useEffect(() => {
    if (state.message?.includes('success')) {
      toast({ title: 'Success!', description: 'Sale updated successfully.' });
      setOpen(false);
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, setOpen]);

  const showSaleAmount = currentStatus === 'completed' || currentStatus === 'sold_in_person';

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={sale.status} onValueChange={(value) => setCurrentStatus(value as SaleStatus)} disabled={isFinalState}>
          <SelectTrigger>
            <SelectValue placeholder='Select a status' />
          </SelectTrigger>
          <SelectContent>
            {(['in_process', 'in_preparation', 'shipped', 'sold_in_person', 'completed', 'canceled'] as SaleStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {showSaleAmount && (
        <div className="space-y-2">
          <Label htmlFor="saleAmount">Sale Amount</Label>
          <div className="relative">
            <Input id="saleAmount" name="saleAmount" type="number" step="1" placeholder="2499" defaultValue={sale.saleAmount} required />
            <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">₽</span>
          </div>
        </div>
      )}
      
      {!isFinalState && <SubmitButton />}
    </form>
  );
}


function CellActions({ row }: { row: any }) {
  const sale = row.original as SaleWithBookName;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';


  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className='h-8 w-8'>
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit Sale</span>
      </Button>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Sale Status</DialogTitle>
            <DialogDescription>
              {isFinalState ? 'This sale is in a final state and cannot be modified.' : 'Change the status of the sale and enter the final amount if applicable.'}
            </DialogDescription>
          </DialogHeader>
          <EditSaleForm sale={sale} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<SaleWithBookName>[] = [
  {
    accessorKey: 'bookName',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
      return <Badge variant={statusVariantMap[status]} className={cn('capitalize')}>{status.replace(/_/g, ' ')}</Badge>;
    },
  },
  {
    accessorKey: 'platform',
    header: 'Platform',
    cell: ({ row }) => <div>{row.getValue('platform') as string}</div>
  },
  {
    accessorKey: 'saleAmount',
    header: 'Sale Amount',
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
    cell: ({ row }) => <div className="text-center"><CellActions row={row} /></div>,
  },
];

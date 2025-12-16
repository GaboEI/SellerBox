'use client';
import React, { useEffect, useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns, SaleWithBookData } from './columns';
import type { Book, Sale, SalePlatform, SaleStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addSale, updateSale, deleteSale } from '@/lib/actions';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '../ui/card';

function SubmitButton({ isClient, t, isEditing }: { isClient: boolean, t: any, isEditing?: boolean }) {
  const { pending } = useFormStatus();
  const text = isEditing ? (pending ? t('saving') : t('save_changes')) : (pending ? t('recording') : t('record_sale'));
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? text : 'Submit'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
};


function AddSaleForm({ books, setOpen, onDataChange, isClient, t }: { books: Book[], setOpen: (open: boolean) => void, onDataChange: () => void, isClient: boolean, t: any }) {
  const [state, formAction] = useFormState(addSale, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const defaultDate = format(new Date(), 'dd.MM.yy');

  useEffect(() => {
    if (state?.message) {
        if (Object.keys(state.errors).length > 0) {
            toast({
                title: isClient ? t('error') : 'Error',
                description: state.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: isClient ? t('success') : 'Success!',
                description: isClient ? t('add_sale_success') : 'Successfully recorded sale.',
            });
            formRef.current?.reset();
            setOpen(false);
            onDataChange();
        }
    }
  }, [state, toast, isClient, t, setOpen, onDataChange]);


  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookId">{isClient ? t('book') : 'Book'}</Label>
        <Select name="bookId">
          <SelectTrigger>
            <SelectValue placeholder={isClient ? t('please_select_a_book') : 'Please select a book.'} />
          </SelectTrigger>
          <SelectContent>
            {books.map(book => (
              <SelectItem key={book.id} value={book.id}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-6 flex-shrink-0 items-center justify-center rounded-sm border bg-muted text-xs font-bold text-muted-foreground">
                  {book.coverImageUrl ? (
                      <Image 
                        src={book.coverImageUrl}
                        alt={book.name}
                        width={24}
                        height={32}
                        className="h-full w-full rounded-sm object-cover"
                      />
                    ) : (
                      <span>?</span>
                    )}
                  </div>
                  <span>{book.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.bookId && <p className="text-sm text-destructive">{state.errors.bookId[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{isClient ? t('date') : 'Date'}</Label>
        <Input
          id="date"
          name="date"
          placeholder="dd.MM.yy"
          defaultValue={defaultDate}
        />
        {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">{isClient ? t('platform') : 'Platform'}</Label>
        <Select name="platform" defaultValue='Avito'>
          <SelectTrigger>
            <SelectValue placeholder={isClient ? t('select_platform') : 'Select a platform'} />
          </SelectTrigger>
          <SelectContent>
            {(['Avito', 'Ozon'] as SalePlatform[]).map(platform => (
                <SelectItem key={platform} value={platform} className="capitalize">
                    {platform}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.platform && <p className="text-sm text-destructive">{state.errors.platform[0]}</p>}
      </div>

      <SubmitButton isClient={isClient} t={t} />
    </form>
  );
}

function EditSaleForm({ sale, setOpen, onDataChange, isClient, t }: { sale: SaleWithBookData; setOpen: (open: boolean) => void; onDataChange: () => void; isClient: boolean; t: any; }) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = React.useState<SaleStatus>(sale.status);

  const updateSaleWithId = updateSale.bind(null, sale.id);
  const [state, formAction] = React.useActionState(updateSaleWithId, initialState);

  const isFinalState = sale.status === 'completed' || sale.status === 'sold_in_person' || sale.status === 'canceled';

  useEffect(() => {
    if (state?.message) {
        if (Object.keys(state.errors).length > 0) {
            toast({ title: isClient ? t('error') : 'Error', description: state.message, variant: 'destructive' });
        } else {
            toast({ title: isClient ? t('success') : 'Success', description: isClient ? t('update_sale_success') : 'Sale updated successfully.' });
            setOpen(false);
            onDataChange();
        }
    }
  }, [state, toast, isClient, t, setOpen, onDataChange]);

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
      
      {!isFinalState && <SubmitButton isClient={isClient} t={t} isEditing />}
    </form>
  );
}

export function SalesClient({ sales, books, onDataChange, onSaleDeleted }: { sales: Sale[], books: Book[], onDataChange: () => void, onSaleDeleted: (id: string) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<SaleWithBookData | null>(null);
  const [filter, setFilter] = React.useState('');
  
  const bookMap = new Map(books.map(b => [b.id, b]));
  
  const handleEditClick = (sale: SaleWithBookData) => {
    setSelectedSale(sale);
    setOpenEditDialog(true);
  };
  
  const handleDeleteClick = (sale: SaleWithBookData) => {
    setSelectedSale(sale);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSale) return;
    
    const result = await deleteSale(selectedSale.id);
    setOpenDeleteDialog(false);
    
    if (result.message) {
        if (result.message.includes('success')) {
            toast({ title: t('success'), description: t('delete_sale_success') });
            onSaleDeleted(selectedSale.id);
        } else {
            toast({ title: t('error'), description: result.message, variant: 'destructive' });
        }
    } else {
        toast({ title: t('error'), description: t('failed_to_delete_sale'), variant: 'destructive' });
    }
  };

  const tableColumns = React.useMemo(() => getColumns(isClient, t, handleEditClick, handleDeleteClick), [isClient, t]);

  const filteredSales = sales.filter(
    (sale) => {
        const book = bookMap.get(sale.bookId);
        return book?.name.toLowerCase().includes(filter.toLowerCase()) ||
               sale.status.toLowerCase().includes(filter.toLowerCase()) ||
                sale.platform.toLowerCase().includes(filter.toLowerCase())
    }
  );

  const salesWithBookData = React.useMemo(() => {
    return filteredSales.map(sale => {
        const book = bookMap.get(sale.bookId);
        return {
            ...sale,
            bookName: book?.name || 'Unknown Book',
            coverImageUrl: book?.coverImageUrl
        }
    });
  }, [filteredSales, bookMap]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isClient ? t('sales_records') : 'Sales Records'}
        description={isClient ? t('view_manage_sales') : 'View and manage all your sales transactions.'}
      >
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              {isClient ? t('record_sale') : 'Record Sale'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isClient ? t('record_new_sale') : 'Record a New Sale'}</DialogTitle>
              <DialogDescription>
                {isClient ? t('record_sale_desc') : 'Fill in the details to log a new sale.'}
              </DialogDescription>
            </DialogHeader>
            <AddSaleForm books={books} setOpen={setOpenAddDialog} onDataChange={onDataChange} isClient={isClient} t={t} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={isClient ? t('filter_sales') : 'Filter by book, status, or platform...'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={tableColumns} data={salesWithBookData} isClient={isClient} />
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isClient ? t('update_sale_status') : 'Update Sale Status'}</DialogTitle>
            <DialogDescription>
                {selectedSale && (selectedSale.status === 'completed' || selectedSale.status === 'sold_in_person' || selectedSale.status === 'canceled')
                ? (isClient ? t('update_sale_final_desc') : 'This sale is in a final state and cannot be modified.')
                : (isClient ? t('update_sale_desc') : 'Change the status of the sale.')}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && <EditSaleForm sale={selectedSale} setOpen={setOpenEditDialog} onDataChange={onDataChange} isClient={isClient} t={t} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{isClient ? t('are_you_sure_delete') : 'Are you absolutely sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {isClient ? t('delete_sale_warning_simple') : 'This will permanently delete the sale record.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{isClient ? t('cancel') : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">{isClient ? t('delete') : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

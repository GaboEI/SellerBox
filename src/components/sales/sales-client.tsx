'use client';
import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { Book, Sale, SalePlatform } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addSale } from '@/lib/actions';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '../ui/card';

function SubmitButton() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('recording') : t('record_sale')) : 'Record Sale'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
  resetKey: '',
};

function AddSaleForm({ books, setOpen }: { books: Book[], setOpen: (open: boolean) => void }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [state, formAction] = useActionState(addSale, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);


  React.useEffect(() => {
    if (state.message.includes('success')) {
      toast({
        title: t('success'),
        description: t('add_sale_success'),
      });
      setOpen(false);
      formRef.current?.reset();
    } else if (state.message) {
      toast({
        title: t('error'),
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen, t]);

  return (
    <form ref={formRef} key={state.resetKey} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookId">{isClient ? t('book') : 'Book'}</Label>
        <Select name="bookId">
          <SelectTrigger>
            <SelectValue placeholder={isClient ? t('select_a_book') : 'Please select a book.'} />
          </SelectTrigger>
          <SelectContent>
            {books.map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
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
          placeholder="DD.MM.YYYY"
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

      <SubmitButton />
    </form>
  );
}

export function SalesClient({ sales, books }: { sales: Sale[], books: Book[] }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  
  const bookMap = new Map(books.map(b => [b.id, b]));

  const filteredSales = sales.filter(
    (sale) => {
        const book = bookMap.get(sale.bookId);
        return book?.name.toLowerCase().includes(filter.toLowerCase()) ||
               sale.status.toLowerCase().includes(filter.toLowerCase()) ||
                sale.platform.toLowerCase().includes(filter.toLowerCase())
    }
  );

  const salesWithBookNames = React.useMemo(() => {
    return filteredSales.map(sale => ({
        ...sale,
        bookName: bookMap.get(sale.bookId)?.name || 'Unknown Book'
    }));
  }, [filteredSales, bookMap]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isClient ? t('sales_records') : 'Sales Records'}
        description={isClient ? t('view_manage_sales') : 'View and manage all your sales transactions.'}
      >
        <Dialog open={open} onOpenChange={setOpen}>
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
            <AddSaleForm books={books} setOpen={setOpen} />
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
        <DataTable columns={columns} data={salesWithBookNames} />
      </Card>
    </div>
  );
}

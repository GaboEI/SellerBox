'use client';
import * as React from 'react';
import { useActionState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  resetKey: Date.now().toString(),
};

function AddSaleForm({ books, setOpen, onDataChange }: { books: Book[], setOpen: (open: boolean) => void, onDataChange: () => void }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [state, formAction] = useActionState(addSale, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [date, setDate] = React.useState<Date | undefined>(new Date());


  React.useEffect(() => {
    if (!state.message) return;
    if (state.message.includes('success')) {
      toast({
        title: isClient ? t('success') : 'Success!',
        description: isClient ? t('add_sale_success') : 'Successfully recorded sale.',
      });
      setOpen(false);
    } else {
      toast({
        title: isClient ? t('error') : 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen, t, isClient]);
  
  React.useEffect(() => {
    if (state.message.includes('success')) {
        formRef.current?.reset();
        setDate(new Date());
        onDataChange();
    }
  }, [state.resetKey, state.message, onDataChange]);


  return (
    <form ref={formRef} key={state.resetKey} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookId">{isClient ? t('book') : 'Book'}</Label>
        <Select name="bookId">
          <SelectTrigger>
            <SelectValue placeholder={isClient ? t('please_select_a_book') : 'Please select a book.'} />
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
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={'outline'}
                className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>{isClient ? t('select_date') : 'Select date'}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                />
            </PopoverContent>
        </Popover>
        <input type="hidden" name="date" value={date ? format(date, 'yyyy-MM-dd') : ''} />

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

export function SalesClient({ sales, books, onDataChange }: { sales: Sale[], books: Book[], onDataChange: () => void }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  
  const bookMap = new Map(books.map(b => [b.id, b]));
  
  const tableColumns = columns(isClient, t);


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
            <AddSaleForm books={books} setOpen={setOpen} onDataChange={onDataChange} />
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
        <DataTable columns={tableColumns} data={salesWithBookNames} isClient={isClient} />
      </Card>
    </div>
  );
}

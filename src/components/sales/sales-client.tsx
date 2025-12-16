'use client';
import *G React from 'react';
import { useFormStatus } from 'react-dom';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useReducer } from 'react';
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
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

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
};

function reducer(state: any, action: any) {
    if (action.type === 'SUCCESS') {
      return {
        message: action.message,
        errors: {},
      };
    }
    if (action.type === 'ERROR') {
      return {
        message: action.message,
        errors: action.errors || {},
      };
    }
    return state;
  }

function AddSaleForm({ books, setOpen, onDataChange }: { books: Book[], setOpen: (open: boolean) => void, onDataChange: () => void }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const defaultDate = format(new Date(), 'dd.MM.yy');

  const formAction = async (formData: FormData) => {
    const result = await addSale(null, formData);
    if (result.message.includes('success')) {
      dispatch({ type: 'SUCCESS', message: result.message });
      onDataChange();
      setOpen(false);
    } else {
      dispatch({ type: 'ERROR', message: result.message, errors: result.errors });
    }
  };

  useEffect(() => {
    if (state.message) {
        if (state.errors && Object.keys(state.errors).length > 0) {
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
        }
    }
  }, [state, toast, isClient, t]);


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
          placeholder="dd.mm.yy"
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
  
  const tableColumns = React.useMemo(() => columns(isClient, t), [isClient, t]);


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
        <DataTable columns={tableColumns} data={salesWithBookData} isClient={isClient} />
      </Card>
    </div>
  );
}

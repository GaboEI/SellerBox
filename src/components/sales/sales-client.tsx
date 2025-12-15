'use client';
import * as React from 'react';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useActionState, useFormStatus } from 'react';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useI18n } from '../i18n/i18n-provider';
import { es, ru, enUS } from 'date-fns/locale';
import { Card } from '../ui/card';

function SubmitButton() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('recording_sale') : t('record_sale_button')}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
  resetKey: '',
};

function AddSaleForm({ books, setOpen }: { books: Book[], setOpen: (open: boolean) => void }) {
  const { t, language } = useI18n();
  const [state, formAction] = useActionState(addSale, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const localeMap: { [key: string]: Locale } = { en: enUS, es, ru };
  const dateLocale = localeMap[language] || enUS;


  React.useEffect(() => {
    if (state.message.includes('success')) {
      toast({
        title: t('success'),
        description: t(state.message),
      });
      setOpen(false);
      formRef.current?.reset();
      setDate(new Date());
    } else if (state.message) {
      toast({
        title: t('error'),
        description: t(state.message),
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen, t]);

  return (
    <form ref={formRef} key={state.resetKey} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookId">{t('book')}</Label>
        <Select name="bookId">
          <SelectTrigger>
            <SelectValue placeholder={t('select_a_book')} />
          </SelectTrigger>
          <SelectContent>
            {books.map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.bookId && <p className="text-sm text-destructive">{t(state.errors.bookId[0])}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t('date_of_sale')}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: dateLocale }) : <span>{t('pick_a_date')}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                locale={dateLocale}
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{
                    before: new Date('2025-01-01'),
                    after: new Date(),
                }}
                initialFocus
                />
            </PopoverContent>
        </Popover>
        <input type="hidden" name="date" value={date?.toISOString()} />
        {state.errors?.date && <p className="text-sm text-destructive">{t(state.errors.date[0])}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">{t('platform')}</Label>
        <Select name="platform" defaultValue='Avito'>
          <SelectTrigger>
            <SelectValue placeholder={t('select_platform')} />
          </SelectTrigger>
          <SelectContent>
            {(['Avito', 'Ozon'] as SalePlatform[]).map(platform => (
                <SelectItem key={platform} value={platform} className="capitalize">
                    {platform}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.platform && <p className="text-sm text-destructive">{t(state.errors.platform[0])}</p>}
      </div>

      <SubmitButton />
    </form>
  );
}

export function SalesClient({ sales, books }: { sales: Sale[], books: Book[] }) {
  const { t } = useI18n();
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
        bookName: bookMap.get(sale.bookId)?.name || t('unknown_book')
    }));
  }, [filteredSales, bookMap, t]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('sales_records')}
        description={t('sales_records_desc')}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              {t('record_sale_button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('record_new_sale_title')}</DialogTitle>
              <DialogDescription>
                {t('record_new_sale_desc')}
              </DialogDescription>
            </DialogHeader>
            <AddSaleForm books={books} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={t('filter_by_book_or_status_platform')}
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

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  addMonths,
  format,
  startOfMonth,
  subMonths,
  subYears,
} from 'date-fns';
import { enUS, es, ru } from 'date-fns/locale';
import Image from 'next/image';

import { PageHeader } from '@/components/shared/page-header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addSale, getBooks } from '@/lib/actions';
import type { Book, SalePlatform } from '@/lib/types';
import { cn } from '@/lib/utils';

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton({ isClient, t }: { isClient: boolean; t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('recording') : t('record_sale')}
    </Button>
  );
}

export default function AddSalePage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [state, formAction] = React.useActionState(addSale, initialState);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  const defaultDate = format(new Date(), 'dd.MM.yy');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [draftDate, setDraftDate] = useState<Date>(() => new Date());
  const today = new Date();
  const minDate = subYears(today, 1);
  const minMonth = startOfMonth(minDate);
  const maxMonth = startOfMonth(today);
  const minNavMonth = startOfMonth(new Date(today.getFullYear() - 10, 0, 1));
  const maxNavMonth = startOfMonth(new Date(today.getFullYear() + 10, 11, 1));
  const localeMap = { en: enUS, es, ru } as const;
  const locale = localeMap[i18n.language as keyof typeof localeMap] ?? enUS;
  const weekStartsOn = 1;
  const displayDate = isPickerOpen ? draftDate : selectedDate;
  const formattedDate = displayDate ? format(displayDate, 'dd.MM.yy') : defaultDate;
  const selectedDateValue = selectedDate ? format(selectedDate, 'dd.MM.yy') : defaultDate;
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    startOfMonth(selectedDate)
  );

  useEffect(() => {
    setIsClient(true);
    async function fetchBooks() {
        const booksData = await getBooks();
        setBooks(booksData);
    }
    fetchBooks();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors).length > 0) {
        toast({
          title: t('error'),
          description: t(state.message),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('success'),
          description: t('add_sale_success'),
        });
        // Redirect is handled by the server action
      }
    }
  }, [state, t, toast]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <PageHeader
            title={t('record_new_sale')}
            description={t('record_sale_desc')}
          >
            <Button variant="outline" size="sm" asChild>
              <Link href="/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('cancel')}
              </Link>
            </Button>
          </PageHeader>
          <div className="mt-8">
            <form action={formAction}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bookId">{t('book')}</Label>
                    <Select name="bookId">
                      <SelectTrigger>
                        <SelectValue placeholder={t('please_select_a_book')} />
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
                    {state.errors?.bookId && (
                      <p className="text-sm text-destructive">
                        {t(state.errors.bookId[0])}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">{t('date')}</Label>
                    <Popover
                      open={isPickerOpen}
                      onOpenChange={(open) => {
                        if (open) {
                          setDraftDate(selectedDate);
                          setCurrentMonth(startOfMonth(selectedDate));
                        }
                        setIsPickerOpen(open);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          {formattedDate || t('select_date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto rounded-md p-0" align="start">
                        <Calendar
                          className="p-2 text-sm"
                          mode="single"
                          selected={draftDate}
                          onSelect={(date: Date | undefined) => {
                            if (!date) return;
                            if (date > today || date < minDate) return;
                            setDraftDate(date);
                          }}
                          locale={locale}
                          weekStartsOn={weekStartsOn}
                          firstWeekContainsDate={4}
                          fixedWeeks
                          showOutsideDays
                          disabled={{ before: minDate, after: today }}
                          fromYear={today.getFullYear() - 10}
                          toYear={today.getFullYear() + 10}
                          captionLayout="dropdown"
                          month={currentMonth}
                          onMonthChange={setCurrentMonth}
                          initialFocus
                        />
                        <div className="flex items-center justify-end gap-2 border-t p-3">
                          <div className="mr-auto flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setCurrentMonth((prev) => subMonths(prev, 1))
                              }
                              disabled={subMonths(currentMonth, 1) < minNavMonth}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="sr-only">
                                {t('previous_month')}
                              </span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setCurrentMonth((prev) => addMonths(prev, 1))
                              }
                              disabled={addMonths(currentMonth, 1) > maxNavMonth}
                            >
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">
                                {t('next_month')}
                              </span>
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setDraftDate(selectedDate);
                              setIsPickerOpen(false);
                            }}
                          >
                            {t('cancel')}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedDate(draftDate);
                              setIsPickerOpen(false);
                            }}
                          >
                            {t('apply')}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input type="hidden" name="date" value={selectedDateValue} />
                    {state.errors?.date && (
                      <p className="text-sm text-destructive">
                        {t(state.errors.date[0])}
                      </p>
                    )}
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
                    {state.errors?.platform && (
                      <p className="text-sm text-destructive">
                        {t(state.errors.platform[0])}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <SubmitButton isClient={isClient} t={t} />
                </CardFooter>
              </Card>
            </form>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

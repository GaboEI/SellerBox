'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  addMonths,
  format,
  isSameDay,
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
import { useDrawerClose } from '@/components/layout/right-drawer-shell';
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
import type { Book, SalePlatform, SaleStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type SaleFormState = {
  message: string;
  errors: {
    bookId?: string[];
    date?: string[];
    status?: string[];
    platform?: string[];
    saleAmount?: string[];
  };
};

const initialState: SaleFormState = {
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

export function AddSaleContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const handleClose = useDrawerClose('/sales');
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [state, formAction] = React.useActionState(addSale, initialState);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [attemptedFutureDate, setAttemptedFutureDate] = useState<Date | null>(
    null
  );
  const [currentStatus, setCurrentStatus] = useState<SaleStatus>(
    'in_preparation'
  );
  const [saleAmountValue, setSaleAmountValue] = useState<string>('');
  const [taxRateValue, setTaxRateValue] = useState<number>(6);
  const [customTaxRate, setCustomTaxRate] = useState<string>('');
  const [taxRateError, setTaxRateError] = useState<string>('');
  
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
  const todayLabel = format(today, 'dd.MM.yyyy');
  const showSaleAmount =
    currentStatus === 'completed' || currentStatus === 'sold_in_person';
  const selectedTaxRate =
    taxRateValue === -1 ? Number(customTaxRate) : taxRateValue;
  const isCustomRate = taxRateValue === -1;
  const isRateValid =
    !isCustomRate ||
    (customTaxRate !== '' &&
      !Number.isNaN(selectedTaxRate) &&
      selectedTaxRate >= 0 &&
      selectedTaxRate <= 100);
  const baseAmount = Number(saleAmountValue);
  const taxAmount =
    !Number.isNaN(baseAmount) && isRateValid
      ? Math.round(Math.round(baseAmount * 100) * (selectedTaxRate / 100)) / 100
      : 0;
  const statusColorMap: Record<SaleStatus, string> = {
    in_preparation: 'bg-secondary',
    in_process: 'bg-yellow-500',
    shipped: 'bg-foreground',
    sold_in_person: 'bg-green-500',
    completed: 'bg-green-500',
    canceled: 'bg-destructive',
  };
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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('sb:sales-refresh'));
        }
        router.refresh();
        handleClose();
      }
    }
  }, [state, t, toast, router, handleClose]);

  return (
    <main className="p-4 lg:p-6">
      <PageHeader
        title={t('record_new_sale')}
        description={t('record_sale_desc')}
      >
        <Button variant="outline" size="sm" onClick={handleClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('cancel')}
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
                        setAttemptedFutureDate(null);
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
                            setAttemptedFutureDate(null);
                          }}
                          onDayClick={(date: Date) => {
                            if (date > today) {
                              setAttemptedFutureDate(date);
                              return;
                            }
                            setAttemptedFutureDate(null);
                          }}
                          modifiers={{
                            highlightToday:
                              isSameDay(draftDate, today) &&
                              ((date: Date) => isSameDay(date, today)),
                            attemptedFuture:
                              attemptedFutureDate &&
                              ((date: Date) =>
                                isSameDay(date, attemptedFutureDate)),
                            future: (date: Date) => date > today,
                          }}
                          modifiersClassNames={{
                            highlightToday:
                              "rounded-full bg-[#46d086] text-foreground",
                            selected:
                              "rounded-full !bg-[#46d086] !text-foreground",
                            attemptedFuture:
                              "rounded-full !bg-[#f22b56] !text-white",
                            future: "text-muted-foreground opacity-50 cursor-not-allowed",
                          }}
                          locale={locale}
                          weekStartsOn={weekStartsOn}
                          firstWeekContainsDate={4}
                          fixedWeeks
                          showOutsideDays
                          disabled={{ before: minDate }}
                          fromYear={2023}
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
                        {attemptedFutureDate && (
                          <p className="px-3 pb-3 text-xs text-red-500">
                            {t('sale_future_warning', {
                              date: todayLabel,
                            })}
                          </p>
                        )}
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
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) =>
                        setCurrentStatus(value as SaleStatus)
                      }
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              statusColorMap[currentStatus]
                            )}
                          />
                          <span>{t(currentStatus)}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            'in_preparation',
                            'in_process',
                            'shipped',
                            'sold_in_person',
                            'completed',
                            'canceled',
                          ] as SaleStatus[]
                        ).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="capitalize"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full',
                                  statusColorMap[status]
                                )}
                              />
                              <span>{t(status)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="status" value={currentStatus} />
                    {state.errors?.status && (
                      <p className="text-sm text-destructive">
                        {t(state.errors.status[0])}
                      </p>
                    )}
                  </div>

                  {showSaleAmount && (
                    <div className="space-y-2">
                      <Label htmlFor="saleAmount">
                        {t('sale_amount_header')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="saleAmount"
                          name="saleAmount"
                          type="number"
                          step="1"
                          placeholder="2499"
                          className="pr-8"
                          required
                          value={saleAmountValue}
                          onChange={(event) =>
                            setSaleAmountValue(event.target.value)
                          }
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                          ₽
                        </span>
                      </div>
                      {state.errors?.saleAmount && (
                        <p className="text-sm text-destructive">
                          {t(state.errors.saleAmount[0])}
                        </p>
                      )}
                    </div>
                  )}
                  {showSaleAmount && (
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">{t('taxes')}</Label>
                      <Select
                        value={String(taxRateValue)}
                        onValueChange={(value) => {
                          const parsed = Number(value);
                          setTaxRateValue(parsed);
                          if (parsed !== -1) {
                            setCustomTaxRate('');
                            setTaxRateError('');
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_tax_rate')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="-1">{t('custom')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {isCustomRate && (
                        <div className="space-y-1">
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            placeholder="7.5"
                            value={customTaxRate}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCustomTaxRate(value);
                              if (value === '') {
                                setTaxRateError(t('tax_rate_invalid'));
                                return;
                              }
                              const numeric = Number(value);
                              if (
                                Number.isNaN(numeric) ||
                                numeric < 0 ||
                                numeric > 100
                              ) {
                                setTaxRateError(t('tax_rate_invalid'));
                              } else {
                                setTaxRateError('');
                              }
                            }}
                          />
                          {taxRateError && (
                            <p className="text-xs text-destructive">
                              {taxRateError}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {t('tax_amount_label')}{' '}
                        <span className="font-semibold text-foreground">
                          {taxAmount.toFixed(2)} ₽
                        </span>
                      </div>
                      <input
                        type="hidden"
                        name="taxRate"
                        value={
                          isRateValid
                            ? String(
                                isCustomRate ? selectedTaxRate : taxRateValue
                              )
                            : ''
                        }
                      />
                      <input
                        type="hidden"
                        name="taxAmount"
                        value={isRateValid ? String(taxAmount) : ''}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="platform">{t('platform')}</Label>
                    <Select name="platform" defaultValue='SellerBox-web'>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select_platform')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(['Avito', 'Ozon', 'SellerBox-web'] as SalePlatform[]).map(
                          (platform) => {
                            const logoSrc =
                              platform === 'Avito'
                                ? '/avito_logo.png'
                                : platform === 'Ozon'
                                ? '/ozon_logo.png'
                                : '/sellerbox_icon.png';

                            return (
                              <SelectItem
                                key={platform}
                                value={platform}
                                className="capitalize before:absolute before:left-2 before:top-1/2 before:h-3.5 before:w-3.5 before:-translate-y-1/2 before:rounded-sm before:border before:border-muted-foreground/40 before:bg-muted/30"
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={logoSrc}
                                    alt={platform}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4 rounded-sm object-contain"
                                  />
                                  <span>{platform}</span>
                                </div>
                              </SelectItem>
                            );
                          }
                        )}
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
  );
}

export default function AddSalePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <AddSaleContent />
      </SidebarInset>
    </SidebarProvider>
  );
}

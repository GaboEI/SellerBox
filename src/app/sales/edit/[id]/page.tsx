'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams, redirect } from 'next/navigation';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/shared/page-header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getSaleById, updateSale, deleteSale, getBookById } from '@/lib/actions';
import type { Book, Sale, SaleStatus } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton({ isClient, t }: { isClient: boolean; t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('saving') : t('save_changes')}
    </Button>
  );
}

export default function EditSalePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const [isClient, setIsClient] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentStatus, setCurrentStatus] = useState<SaleStatus | undefined>(
    undefined
  );
  const [saleAmountValue, setSaleAmountValue] = useState<string>('');
  const [taxRateValue, setTaxRateValue] = useState<number>(6);
  const [customTaxRate, setCustomTaxRate] = useState<string>('');
  const [taxRateError, setTaxRateError] = useState<string>('');
  const forcedStatus = searchParams.get('status') as SaleStatus | null;
  const isForcedStatus =
    forcedStatus === 'completed' || forcedStatus === 'sold_in_person';
  const statusVariantMap: Record<
    SaleStatus,
    'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  > = {
    in_process: 'warning',
    in_preparation: 'secondary',
    shipped: 'outline',
    sold_in_person: 'success',
    completed: 'default',
    canceled: 'destructive',
  };

  const updateSaleWithId = updateSale.bind(null, id);
  const [state, formAction] = React.useActionState(updateSaleWithId, initialState);

  useEffect(() => {
    setIsClient(true);
    async function fetchSale() {
      if (!id) return;
      try {
        const fetchedSale = await getSaleById(id);
        if (fetchedSale) {
          setSale(fetchedSale);
          setCurrentStatus(isForcedStatus ? forcedStatus : fetchedSale.status);
          setSaleAmountValue(
            typeof fetchedSale.saleAmount === 'number'
              ? String(fetchedSale.saleAmount)
              : ''
          );
          if (typeof fetchedSale.taxRate === 'number') {
            const presetRates = [6, 10, 15, 20];
            if (presetRates.includes(fetchedSale.taxRate)) {
              setTaxRateValue(fetchedSale.taxRate);
              setCustomTaxRate('');
              setTaxRateError('');
            } else {
              setTaxRateValue(-1);
              setCustomTaxRate(String(fetchedSale.taxRate));
              setTaxRateError('');
            }
          } else {
            setTaxRateValue(6);
            setCustomTaxRate('');
            setTaxRateError('');
          }
          const fetchedBook = await getBookById(fetchedSale.bookId);
          setBook(fetchedBook ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch sale', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSale();
  }, [id]);

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
          description: t('update_sale_success'),
        });
        router.push('/sales');
      }
    }
  }, [state, t, toast, router]);
  
  const handleDeleteConfirm = async () => {
    const result = await deleteSale(id);
    if (result && result.message) {
        toast({ title: t('error'), description: t(result.message), variant: 'destructive'});
    } else {
        toast({ title: t('success'), description: t('delete_sale_success')});
        router.push('/sales');
    }
  };

  const isFinalState =
    sale?.status === 'completed' ||
    sale?.status === 'sold_in_person' ||
    sale?.status === 'canceled';

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <PageHeader
            title={t('edit_sale')}
            description={
              isFinalState ? t('update_sale_final_desc') : t('update_sale_desc')
            }
          >
            <Button variant="outline" size="sm" asChild>
              <Link href="/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('cancel')}
              </Link>
            </Button>
          </PageHeader>
          <div className="mt-8">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : sale ? (
              <form action={formAction}>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {book && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-sm border bg-muted text-xs font-bold text-muted-foreground">
                          {book.coverImageUrl ? (
                            <Image
                              src={book.coverImageUrl}
                              alt={book.name}
                              width={36}
                              height={48}
                              className="h-full w-full rounded-sm object-cover"
                            />
                          ) : (
                            <span>?</span>
                          )}
                        </div>
                        <div className="leading-tight">
                          <div className="text-base font-semibold">
                            {book.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('product_code')}: {book.code || '-'}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="status">
                        {t('status')}
                    </Label>
                    {isForcedStatus && forcedStatus ? (
                      <div className="flex items-center">
                        <Badge
                          variant={statusVariantMap[forcedStatus]}
                          className="capitalize"
                        >
                          {t(forcedStatus)}
                        </Badge>
                        <input
                          type="hidden"
                          name="status"
                          value={forcedStatus}
                        />
                      </div>
                    ) : (
                      <Select
                        name="status"
                        defaultValue={sale.status}
                        onValueChange={(value) =>
                          setCurrentStatus(value as SaleStatus)
                        }
                        disabled={isFinalState}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('select_status')}
                          />
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
                              {t(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                            value={saleAmountValue}
                            onChange={(event) =>
                              setSaleAmountValue(event.target.value)
                            }
                            className="pr-8"
                            required
                            disabled={isFinalState}
                          />
                          <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            ₽
                          </span>
                        </div>
                      </div>
                    )}

                    {showSaleAmount && (
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">{t('taxes')}</Label>
                        <Select
                          name="taxRatePreset"
                          value={String(taxRateValue)}
                          onValueChange={(value) => {
                            const parsed = Number(value);
                            setTaxRateValue(parsed);
                            if (parsed !== -1) {
                              setCustomTaxRate('');
                              setTaxRateError('');
                            }
                          }}
                          disabled={isFinalState}
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
                              disabled={isFinalState}
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
                  </CardContent>
                  {!isFinalState && (
                    <CardFooter className="justify-between">
                      <SubmitButton isClient={isClient} t={t} />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" type="button">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('delete_sale')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('are_you_sure_delete')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('delete_sale_warning_simple')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                  )}
                </Card>
              </form>
            ) : (
              <p>{t('sale_not_found')}</p>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

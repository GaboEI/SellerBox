'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, redirect } from 'next/navigation';
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
import { getSaleById, updateSale, deleteSale } from '@/lib/actions';
import type { Sale, SaleStatus } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton({ isClient, t }: { isClient: boolean; t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('saving') : t('save_changes')) : 'Save Changes'}
    </Button>
  );
}

export default function EditSalePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isClient, setIsClient] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentStatus, setCurrentStatus] = useState<SaleStatus | undefined>(
    undefined
  );

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
          setCurrentStatus(fetchedSale.status);
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
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('success'),
          description: t('update_sale_success'),
        });
        // Redirect is handled by the server action
      }
    }
  }, [state, t, toast]);
  
  const handleDeleteConfirm = async () => {
    const result = await deleteSale(id);
    if (result && result.message) {
        toast({ title: t('error'), description: result.message, variant: 'destructive'});
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <PageHeader
            title={isClient ? t('edit_sale') : 'Edit Sale'}
            description={
              isFinalState
                ? isClient
                  ? t('update_sale_final_desc')
                  : 'This sale is in a final state and cannot be modified.'
                : isClient
                ? t('update_sale_desc')
                : 'Change the status of the sale.'
            }
          >
            <Button variant="outline" size="sm" asChild>
              <Link href="/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isClient ? t('cancel') : 'Cancel'}
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
                    <div className="space-y-2">
                      <Label htmlFor="status">
                        {isClient ? t('status') : 'Status'}
                      </Label>
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
                            placeholder={
                              isClient
                                ? t('select_status')
                                : 'Select a status'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'in_process',
                            'in_preparation',
                            'shipped',
                            'sold_in_person',
                            'completed',
                            'canceled',
                          ] as SaleStatus[]).map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="capitalize"
                            >
                              {isClient ? t(status) : status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showSaleAmount && (
                      <div className="space-y-2">
                        <Label htmlFor="saleAmount">
                          {isClient
                            ? t('sale_amount_header')
                            : 'Sale Amount'}
                        </Label>
                        <div className="relative">
                          <Input
                            id="saleAmount"
                            name="saleAmount"
                            type="number"
                            step="1"
                            placeholder="2499"
                            defaultValue={sale.saleAmount}
                            required
                          />
                          <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            ₽
                          </span>
                        </div>
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
                              {isClient ? t('delete_sale') : 'Delete Sale'}
                            </Button>
                          </AlertDialogTrigger>
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
                    </CardFooter>
                  )}
                </Card>
              </form>
            ) : (
              <p>Sale not found.</p>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

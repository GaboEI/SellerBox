'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
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

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton({ isClient, t }: { isClient: boolean; t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('recording') : t('record_sale')) : 'Record Sale'}
    </Button>
  );
}

export default function AddSalePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [state, formAction] = React.useActionState(addSale, initialState);
  
  const defaultDate = format(new Date(), 'dd.MM.yy');

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
          description: state.message,
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
            title={isClient ? t('record_new_sale') : 'Record a New Sale'}
            description={
              isClient
                ? t('record_sale_desc')
                : 'Fill in the details to log a new sale.'
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
            <form action={formAction}>
              <Card>
                <CardContent className="p-6 space-y-6">
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

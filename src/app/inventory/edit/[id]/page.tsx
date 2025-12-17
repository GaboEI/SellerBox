'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { getBookById, updateBook, deleteBook } from '@/lib/actions';
import type { Book } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const initialState = {
  message: '',
  errors: {},
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function SubmitButton({ isClient, t }: { isClient: boolean; t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('saving') : t('save_changes')) : 'Save Changes'}
    </Button>
  );
}

export default function EditBookPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isClient, setIsClient] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  const updateBookWithId = updateBook.bind(null, id);
  const [state, formAction] = React.useActionState(
    updateBookWithId,
    initialState
  );

  useEffect(() => {
    setIsClient(true);
    async function fetchBook() {
      if (!id) return;
      try {
        const fetchedBook = await getBookById(id);
        if (fetchedBook) {
          setBook(fetchedBook);
          setImagePreview(fetchedBook.coverImageUrl || null);
          setCoverImageUrl(fetchedBook.coverImageUrl || '');
        }
      } catch (error) {
        console.error('Failed to fetch book', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
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
          description: t('update_book_success'),
        });
        // Redirect is handled by the server action
      }
    }
  }, [state, t, toast]);

  const handleDeleteConfirm = async () => {
    const result = await deleteBook(id);
    if (result && result.message) {
      toast({
        title: t('error'),
        description: result.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: t('delete_book_success', { bookName: book?.name || '' }),
      });
      router.push('/inventory');
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t('error'),
          description: t('file_too_large', { size: '2MB' }),
          variant: 'destructive',
        });
        event.target.value = '';
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: t('error'),
          description: t('invalid_file_type'),
          variant: 'destructive',
        });
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setCoverImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <PageHeader
            title={isClient ? t('edit_book') : 'Edit Book'}
            description={
              isClient
                ? t('edit_book_desc')
                : 'Make changes to the book details. The code must remain unique.'
            }
          >
            <Button variant="outline" size="sm" asChild>
              <Link href="/inventory">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isClient ? t('cancel') : 'Cancel'}
              </Link>
            </Button>
          </PageHeader>
          <div className="mt-8">
            {loading ? (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ) : book ? (
              <form action={formAction}>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="code">
                        {isClient ? t('code_unique') : 'Code (Unique)'}
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        defaultValue={book.code}
                        required
                      />
                      {state.errors?.code && (
                        <p className="text-sm text-destructive">
                          {state.errors.code[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {isClient ? t('name') : 'Name'}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={book.name}
                        required
                      />
                      {state.errors?.name && (
                        <p className="text-sm text-destructive">
                          {state.errors.name[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image-upload">{isClient ? t('cover_photo') : 'Cover Photo'}</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Cover preview"
                                        width={96}
                                        height={96}
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold">?</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="relative bg-accent text-accent-foreground hover:bg-accent/90"
                              >
                                {isClient ? t('select_photo') : 'Select photo'}
                                <Input
                                  id="image-upload"
                                  name="image-upload"
                                  type="file"
                                  accept={ALLOWED_FILE_TYPES.join(',')}
                                  onChange={handleImageUpload}
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                              </Button>
                              <p className="text-xs text-muted-foreground">
                                {isClient ? t('image_specs') : 'JPG, PNG, WEBP. Max 2MB.'}
                              </p>
                            </div>
                        </div>
                        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <SubmitButton isClient={isClient} t={t} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isClient ? t('delete_book') : 'Delete Book'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isClient ? t('are_you_sure') : 'Are you sure?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isClient
                              ? t('delete_book_warning')
                              : 'This action cannot be undone. This will permanently delete the book.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {isClient ? t('cancel') : 'Cancel'}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isClient ? t('delete') : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </form>
            ) : (
              <p>Book not found.</p>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

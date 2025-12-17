'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/shared/page-header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addBook } from '@/lib/actions';
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
      {isClient ? (pending ? t('adding') : t('add_book')) : 'Add Book'}
    </Button>
  );
}

export default function AddBookPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [state, formAction] = React.useActionState(addBook, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
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
          description: t('add_book_success'),
        });
        // Redirect is handled by the server action
      }
    }
  }, [state, t, toast]);

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
            title={isClient ? t('add_new_book') : 'Add a New Book'}
            description={
              isClient
                ? t('add_book_desc')
                : 'Enter the details for the new book to add it to your catalog.'
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
            <form action={formAction}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      {isClient ? t('code_unique') : 'Code (Unique)'}
                    </Label>
                    <Input id="code" name="code" required />
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
                    <Input id="name" name="name" required />
                    {state.errors?.name && (
                      <p className="text-sm text-destructive">
                        {state.errors.name[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">
                      {isClient ? t('cover_photo') : 'Cover Photo'}
                    </Label>
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
                    <input
                      type="hidden"
                      name="coverImageUrl"
                      value={coverImageUrl}
                    />
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

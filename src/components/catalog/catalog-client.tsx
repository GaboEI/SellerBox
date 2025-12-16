'use client';
import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { PlusCircle } from 'lucide-react';
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
import type { Book as BookType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addBook } from '@/lib/actions';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? (pending ? t('adding') : t('add_book')) : 'Add Book'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
};


function AddBookForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [state, formAction] = React.useActionState(addBook, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = React.useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setCoverImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (state?.message) {
      if (Object.keys(state.errors).length > 0) {
        toast({
          title: isClient ? t('error') : 'Error',
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: isClient ? t('success') : 'Success!',
          description: isClient ? t('add_book_success') : 'Successfully added book.',
        });
        formRef.current?.reset();
        setImagePreview(null);
        setCoverImageUrl('');
        setOpen(false);
        router.refresh();
      }
    }
  }, [state, toast, isClient, t, setOpen, router]);
  
  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">{isClient ? t('code_unique') : 'Code (Unique)'}</Label>
        <Input id="code" name="code" required />
        {state.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{isClient ? t('name') : 'Name'}</Label>
        <Input id="name" name="name" required />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
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
          <Input id="image-upload" name="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="max-w-xs" />
        </div>
        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      </div>
      <SubmitButton />
    </form>
  );
}

export function CatalogClient({ books }: { books: BookType[] }) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');

  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );
  
  const tableColumns = columns(isClient, t);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isClient ? t('master_catalog') : 'Master Catalog'}
        description={isClient ? t('manage_book_collection') : 'Manage your complete book collection.'}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              {isClient ? t('add_book') : 'Add Book'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isClient ? t('add_new_book') : 'Add a New Book'}</DialogTitle>
              <DialogDescription>
                {isClient ? t('add_book_desc') : 'Enter the details for the new book to add it to your catalog.'}
              </DialogDescription>
            </DialogHeader>
            <AddBookForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={isClient ? t('filter_by_name_or_code') : 'Filter by name or code...'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={tableColumns} data={filteredBooks} isClient={isClient} />
      </Card>
    </div>
  );
}

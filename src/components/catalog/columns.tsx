'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import Image from 'next/image';
import { TFunction } from 'i18next';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateBook, deleteBook } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function SubmitButton({ isClient, t }: { isClient: boolean, t: TFunction }) {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {isClient ? (pending ? t('saving') : t('save_changes')) : 'Save Changes'}
      </Button>
    );
  }
  
const initialState = {
    message: '',
    errors: {},
};


function EditBookForm({ book, setOpen, isClient, t }: { book: Book, setOpen: (open: boolean) => void, isClient: boolean, t: TFunction }) {
    const router = useRouter();
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = React.useState<string | null>(book.coverImageUrl || null);
    const [coverImageUrl, setCoverImageUrl] = React.useState<string>(book.coverImageUrl || '');

    const updateBookWithId = updateBook.bind(null, book.id);
    const [state, formAction] = useFormState(updateBookWithId, initialState);


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
              description: isClient ? t('update_book_success') : 'Book updated successfully.',
            });
            setOpen(false);
            router.refresh();
          }
        }
    }, [state, toast, isClient, t, setOpen, router]);
    
    return (
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">{isClient ? t('code_unique') : 'Code (Unique)'}</Label>
          <Input id="code" name="code" defaultValue={book.code} required />
          {state.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{isClient ? t('name') : 'Name'}</Label>
          <Input id="name" name="name" defaultValue={book.name} required />
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
        <SubmitButton isClient={isClient} t={t} />
      </form>
    );
  }
  

const CellActions: React.FC<{ row: any, isClient: boolean, t: TFunction }> = ({ row, isClient, t }) => {
  const book = row.original as Book;
  const { toast } = useToast();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    const result = await deleteBook(book.id);
    setIsDeleteDialogOpen(false); 
    if (result && result.message) {
        toast({ title: t('error'), description: result.message, variant: 'destructive'});
    } else {
        toast({ title: t('success'), description: t('delete_book_success', {bookName: book.name}) });
        router.refresh();
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{isClient ? t('actions') : 'Actions'}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(book.code)}>
            {isClient ? t('copy_code') : 'Copy Code'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>{isClient ? t('edit_book') : 'Edit Book'}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">{isClient ? t('delete_book') : 'Delete Book'}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{isClient ? t('edit_book') : 'Edit Book'}</DialogTitle>
            <DialogDescription>
                {isClient ? t('edit_book_desc') : 'Make changes to the book details. The code must remain unique.'}
            </DialogDescription>
            </DialogHeader>
            <EditBookForm book={book} setOpen={setIsEditDialogOpen} isClient={isClient} t={t} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{isClient ? t('are_you_sure') : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
                {isClient ? t('delete_book_warning') : 'This action cannot be undone. This will permanently delete the book.'}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{isClient ? t('cancel') : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{isClient ? t('delete') : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns = (isClient: boolean, t: TFunction): ColumnDef<Book>[] => [
    {
      accessorKey: 'coverImageUrl',
      header: isClient ? t('cover_photo_header') : 'COVER PHOTO',
      cell: ({ row }) => {
        const imageUrl = row.getValue('coverImageUrl') as string | undefined;
        return (
          <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-2xl font-bold text-muted-foreground">
            {imageUrl && imageUrl !== '?' ? (
              <Image 
                src={imageUrl}
                alt={row.original.name}
                width={48}
                height={64}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <span>?</span>
            )}
          </div>
        )
      },
      size: 80,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0"
          >
            {isClient ? t('code_header') : 'Code'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0"
          >
            {isClient ? t('name_header') : 'Name'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellActions row={row} isClient={isClient} t={t} />,
      size: 60,
    },
  ];
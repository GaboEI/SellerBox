'use client';
import * as React from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { usePathname } from 'next/navigation';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import type { Book as BookType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addBook, updateBook, deleteBook } from '@/lib/actions';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

function SubmitButton({ isClient, t, isEditing }: { isClient: boolean, t: any, isEditing?: boolean }) {
  const { pending } = useFormStatus();
  const text = isEditing ? (pending ? t('saving') : t('save_changes')) : (pending ? t('adding') : t('add_book'));
  return (
    <Button type="submit" disabled={pending}>
      {isClient ? text : 'Submit'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
};


function AddBookForm({ setOpen, onDataChange, isClient, t }: { setOpen: (open: boolean) => void, onDataChange: () => void, isClient: boolean, t: any }) {
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
        onDataChange();
      }
    }
  }, [state, toast, isClient, t, setOpen, onDataChange]);
  
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
      <SubmitButton isClient={isClient} t={t} />
    </form>
  );
}

function EditBookForm({ book, setOpen, onDataChange, isClient, t }: { book: BookType, setOpen: (open: boolean) => void, onDataChange: () => void, isClient: boolean, t: any }) {
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = React.useState<string | null>(book.coverImageUrl || null);
    const [coverImageUrl, setCoverImageUrl] = React.useState<string>(book.coverImageUrl || '');

    const updateBookWithId = updateBook.bind(null, book.id);
    const [state, formAction] = React.useActionState(updateBookWithId, initialState);


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
            onDataChange();
          }
        }
    }, [state, toast, isClient, t, setOpen, onDataChange]);
    
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
        <SubmitButton isClient={isClient} t={t} isEditing />
      </form>
    );
}

export function CatalogClient({ books, onDataChange, onBookDeleted }: { books: BookType[], onDataChange: () => void, onBookDeleted: (id: string) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<BookType | null>(null);
  const [filter, setFilter] = React.useState('');
  const pathname = usePathname();

  useEffect(() => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedBook(null);
  }, [pathname]);

  const handleEditOpen = (book: BookType) => {
    setSelectedBook(book);
    setOpenEditDialog(true);
  };

  const handleEditClose = (open: boolean) => {
    if (!open) {
      setSelectedBook(null);
    }
    setOpenEditDialog(open);
  }

  const handleDeleteOpen = (book: BookType) => {
    setSelectedBook(book);
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteClose = (open: boolean) => {
    if (!open) {
      setSelectedBook(null);
    }
    setOpenDeleteDialog(open);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    const result = await deleteBook(selectedBook.id);
    handleDeleteClose(false); 
    if (result && result.message) {
        toast({ title: t('error'), description: result.message, variant: 'destructive'});
    } else {
        toast({ title: t('success'), description: t('delete_book_success', {bookName: selectedBook.name}) });
        onBookDeleted(selectedBook.id);
    }
  };
  
  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );
  
  const tableColumns = React.useMemo(() => getColumns(isClient, t, handleEditOpen, handleDeleteOpen), [isClient, t]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isClient ? t('master_catalog') : 'Master Catalog'}
        description={isClient ? t('manage_book_collection') : 'Manage your complete book collection.'}
      >
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
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
            <AddBookForm setOpen={setOpenAddDialog} onDataChange={onDataChange} isClient={isClient} t={t} />
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

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={handleEditClose}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{isClient ? t('edit_book') : 'Edit Book'}</DialogTitle>
            <DialogDescription>
                {isClient ? t('edit_book_desc') : 'Make changes to the book details. The code must remain unique.'}
            </DialogDescription>
            </DialogHeader>
            {selectedBook && <EditBookForm book={selectedBook} setOpen={setOpenEditDialog} onDataChange={onDataChange} isClient={isClient} t={t} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={handleDeleteClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{isClient ? t('are_you_sure') : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
                {isClient ? t('delete_book_warning') : 'This action cannot be undone. This will permanently delete the book.'}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{isClient ? t('cancel') : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">{isClient ? t('delete') : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

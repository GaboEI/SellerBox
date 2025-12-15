'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';

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
import { useI18n } from '../i18n/i18n-provider';

function SubmitButton() {
    const { t } = useI18n();
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? t('saving') : t('save_changes')}
      </Button>
    );
  }
  
const initialState = {
    message: '',
    errors: {},
    resetKey: Date.now().toString(),
};

function EditBookForm({ book, setOpen, onDataChange }: { book: Book, setOpen: (open: boolean) => void, onDataChange: () => void }) {
    const { t } = useI18n();
    const [state, formAction] = useActionState(updateBook.bind(null, book.id), initialState);
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = React.useState<string | null>(book.coverImageUrl || null);
    const [coverImageUrl, setCoverImageUrl] = React.useState<string>(book.coverImageUrl || '');

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
  
    React.useEffect(() => {
      if (!state.message) return;
      if (state.message.includes('success')) {
        toast({
          title: t('success'),
          description: t(state.message),
        });
        setOpen(false);
        onDataChange();
      } else {
        toast({
          title: t('error'),
          description: t(state.message),
          variant: 'destructive',
        });
      }
    }, [state, toast, setOpen, t, onDataChange]);
    
    return (
      <form action={formAction} key={state.resetKey} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">{t('code')} ({t('unique')})</Label>
          <Input id="code" name="code" defaultValue={book.code} required />
          {state.errors?.code && <p className="text-sm text-destructive">{t(state.errors.code[0])}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input id="name" name="name" defaultValue={book.name} required />
          {state.errors?.name && <p className="text-sm text-destructive">{t(state.errors.name[0])}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="image-upload">{t('cover_photo')}</Label>
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
  

const CellActions: React.FC<{ row: any, onDataChange: () => void }> = ({ row, onDataChange }) => {
  const { t } = useI18n();
  const book = row.original as Book;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    await deleteBook(book.id);
    onDataChange();
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
          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(book.code)}>
            {t('copy_code')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>{t('edit_book')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">{t('delete_book')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t('edit_book_title')}</DialogTitle>
            <DialogDescription>
                {t('edit_book_desc')}
            </DialogDescription>
            </DialogHeader>
            <EditBookForm book={book} setOpen={setIsEditDialogOpen} onDataChange={onDataChange} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
                {t('delete_book_warning')}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns = (onDataChange: () => void): ColumnDef<Book>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: '',
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
    }
  },
  {
    accessorKey: 'code',
    header: ({ column }) => {
        const { t } = useI18n();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('code')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
        const { t } = useI18n();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('name')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions row={row} onDataChange={onDataChange} />,
  },
];

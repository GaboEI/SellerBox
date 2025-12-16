'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TFunction } from 'i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Book } from '@/lib/types';
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
import { useFormState, useFormStatus } from 'react-dom';
import { updateBook } from '@/lib/actions';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

const initialState = {
  message: '',
  errors: {},
};

function EditBookForm({ book, setDialogOpen }: { book: Book, setDialogOpen: (open: boolean) => void }) {
    const { t } = useTranslation();
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => { setIsClient(true); }, []);
    
    const router = useRouter();

    const updateBookWithId = updateBook.bind(null, book.id);
    const [state, formAction] = React.useActionState(updateBookWithId, initialState);


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
    
    const formRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (state?.message) {
             setDialogOpen(false);
        }
    }, [state, setDialogOpen]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">{isClient ? t('code_unique') : 'Code (Unique)'}</Label>
                <Input id="code" name="code" defaultValue={book.code} required />
                {state?.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">{isClient ? t('name') : 'Name'}</Label>
                <Input id="name" name="name" defaultValue={book.name} required />
                {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
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
             <Button type="submit">{isClient ? t('save_changes') : 'Save Changes'}</Button>
        </form>
    )
}

const CellActions: React.FC<{
  row: any,
  isClient: boolean,
  t: TFunction,
  onBookDeleted: (bookId: string) => void,
  onEdit: (book: Book) => void,
  onDelete: (book: Book) => void
}> = ({ row, isClient, t, onBookDeleted, onEdit, onDelete }) => {
  const book = row.original as Book;

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
          <DropdownMenuItem asChild>
            <Link href={`/inventory/edit/${book.id}`}>{isClient ? t('edit_book') : 'Edit Book'}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(book)}>
              <span className="text-destructive">{isClient ? t('delete_book') : 'Delete Book'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
import { useTranslation } from 'react-i18next';


export const getColumns = (isClient: boolean, t: TFunction, onEdit: (book: Book) => void, onDelete: (book: Book) => void, onBookDeleted: (bookId: string) => void): ColumnDef<Book>[] => [
    {
      accessorKey: 'coverImageUrl',
      header: isClient ? t('cover_photo_header') : 'COVER PHOTO',
      cell: ({ row }) => {
        const imageUrl = row.getValue('coverImageUrl') as string | undefined;
        return (
          <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold text-muted-foreground">
            {imageUrl && imageUrl !== '?' ? (
              <Image 
                src={imageUrl}
                alt={row.original.name}
                width={36}
                height={48}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <span>?</span>
            )}
          </div>
        )
      },
      size: 60,
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
      cell: ({ row }) => <CellActions row={row} isClient={isClient} t={t} onBookDeleted={onBookDeleted} onEdit={onEdit} onDelete={onDelete} />,
      size: 60,
    },
  ];

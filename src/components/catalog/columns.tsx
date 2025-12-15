'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

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
import { Textarea } from '@/components/ui/textarea';
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

function EditBookForm({ book, setOpen, onDataChange }: { book: Book, setOpen: (open: boolean) => void, onDataChange: () => void }) {
    const { t } = useI18n();
    const [state, formAction] = useFormState(updateBook.bind(null, book.id), { message: '', errors: {} });
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
  
    React.useEffect(() => {
      if (state.message.includes('success')) {
        toast({
          title: t('success'),
          description: t(state.message),
        });
        setOpen(false);
        onDataChange();
      } else if (state.message) {
        toast({
          title: t('error'),
          description: t(state.message),
          variant: 'destructive',
        });
      }
    }, [state, toast, setOpen, t, onDataChange]);
    
    return (
      <form ref={formRef} action={formAction} className="space-y-4">
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
          <Label htmlFor="quantity">{t('quantity')}</Label>
          <Input id="quantity" name="quantity" type="number" defaultValue={book.quantity} required />
          {state.errors?.quantity && <p className="text-sm text-destructive">{t(state.errors.quantity[0])}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea id="description" name="description" defaultValue={book.description} />
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
    accessorKey: 'quantity',
    header: ({ column }) => {
        const { t } = useI18n();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right"
        >
          {t('quantity')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue('quantity'));
      return <div className="text-center font-medium">{quantity}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions row={row} onDataChange={onDataChange} />,
  },
];

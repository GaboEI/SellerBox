'use client';
import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import type { Book as BookType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteBook } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CatalogGrid } from './catalog-grid';

export function CatalogClient({
  books,
  onBookDeleted,
}: {
  books: BookType[];
  onBookDeleted: (bookId: string) => void;
}) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [filter, setFilter] = React.useState('');

  const { toast } = useToast();
  const router = useRouter();

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBookToDelete, setSelectedBookToDelete] =
    useState<BookType | null>(null);

  const openDeleteDialog = (book: BookType) => {
    setSelectedBookToDelete(book);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEdit = (book: BookType) => {
    router.push(`/inventory/edit/${book.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookToDelete) return;

    const bookIdToDelete = selectedBookToDelete.id;
    const bookNameToDelete = selectedBookToDelete.name;

    // Close the dialog first
    setIsDeleteDialogOpen(false);

    const result = await deleteBook(bookIdToDelete);

    if (result && result.message) {
      toast({
        title: t('error'),
        description: result.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: t('delete_book_success', {
          bookName: bookNameToDelete,
        }),
      });
      // Update local state instead of global refresh
      onBookDeleted(bookIdToDelete);
    }
    // Reset selected book after action
    setSelectedBookToDelete(null);
  };

  const filteredBooks = React.useMemo(
    () =>
      books.filter(
        (book) =>
          book.name.toLowerCase().includes(filter.toLowerCase()) ||
          book.code.toLowerCase().includes(filter.toLowerCase())
      ),
    [books, filter]
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isClient ? t('master_catalog') : 'Master Catalog'}
          description={
            isClient
              ? t('manage_book_collection')
              : 'Manage your complete book collection.'
          }
        >
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              {isClient ? t('add_book') : 'Add Book'}
            </Link>
          </Button>
        </PageHeader>
        <div className="mb-2">
          <Input
            placeholder={
              isClient
                ? t('filter_by_name_or_code')
                : 'Filter by name or code...'
            }
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <CatalogGrid books={filteredBooks} onEdit={handleEdit} onDelete={openDeleteDialog} />

      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBookToDelete(null);
          }
          setIsDeleteDialogOpen(open);
        }}
      >
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
    </>
  );
}
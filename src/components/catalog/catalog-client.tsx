'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns, SaleWithBookData } from './columns';
import type { Book as BookType, Sale } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
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

  const handleDeleteConfirm = async () => {
    if (!selectedBookToDelete) return;
    const result = await deleteBook(selectedBookToDelete.id);
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
          bookName: selectedBookToDelete.name,
        }),
      });
      onBookDeleted(selectedBookToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedBookToDelete(null);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );

  const tableColumns = React.useMemo(
    () => getColumns(isClient, t, openDeleteDialog),
    [isClient, t]
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isClient ? t('warehouse') + ' / ' + t('master_catalog') : 'Warehouse / Master Catalog'}
          description={
            isClient
              ? t('manage_book_collection')
              : 'Manage your complete book collection.'
          }
        >
          <Button size="sm" className="gap-1" asChild>
            <Link href="/inventory/add">
              <PlusCircle className="h-4 w-4" />
              {isClient ? t('add_book') : 'Add Book'}
            </Link>
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4">
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
            <DataTable
              columns={tableColumns}
              data={filteredBooks}
              isClient={isClient}
            />
          </CardContent>
        </Card>
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
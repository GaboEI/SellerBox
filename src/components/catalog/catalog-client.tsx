'use client';
import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import type { Book as BookType } from '@/lib/types';
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
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBookToDelete, setSelectedBookToDelete] =
    useState<BookType | null>(null);

  const openDeleteDialog = (book: BookType) => {
    setSelectedBookToDelete(book);
    setIsDeleteDialogOpen(true);
  };
  
  useEffect(() => {
    // Cleanup state when navigating away from the page
    return () => {
      setIsDeleteDialogOpen(false);
      setSelectedBookToDelete(null);
    };
  }, [pathname]);

  const handleDeleteConfirm = async () => {
    if (!selectedBookToDelete) return;

    // Close the dialog first
    setIsDeleteDialogOpen(false);
    
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
      // Update local state instead of global refresh
      onBookDeleted(selectedBookToDelete.id);
    }
    // Reset selected book after action
    setSelectedBookToDelete(null);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );

  const tableColumns = React.useMemo(
    () => getColumns(t, openDeleteDialog),
    [t]
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
          <Button size="icon" className="h-8 w-8 rounded-full" asChild>
            <Link href="/inventory/add">
              <Plus className="h-4 w-4" />
              <span className="sr-only">{isClient ? t('add_book') : 'Add Book'}</span>
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
            />
          </CardContent>
        </Card>
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

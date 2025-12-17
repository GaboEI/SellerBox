'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Book } from '@/lib/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

interface CatalogGridProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const BookCard: React.FC<{ book: Book; onEdit: () => void; onDelete: () => void }> = ({ book, onEdit, onDelete }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="relative h-48 w-full p-0">
        <Image
          src={book.coverImageUrl || 'https://placehold.co/600x400/EEE/31343C?text=?'}
          alt={book.name}
          fill
          className="object-cover"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold">{book.name}</h3>
        <p className="text-sm text-muted-foreground">{book.code}</p>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">{isClient ? t('edit_book') : 'Edit'}</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{isClient ? t('delete_book') : 'Delete'}</span>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export const CatalogGrid: React.FC<CatalogGridProps> = ({ books, onEdit, onDelete }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const { t } = useTranslation();
    
  if (books.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>{isClient ? t('no_results') : 'No books found.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={() => onEdit(book)}
          onDelete={() => onDelete(book)}
        />
      ))}
    </div>
  );
};
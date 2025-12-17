'use client';

import {
  Card,
  CardContent,
  CardFooter,
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

const BookCard: React.FC<{
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ book, onEdit, onDelete }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const { t } = useTranslation();

  return (
    <Card
      className="
        flex flex-col
        overflow-hidden
        rounded-2xl
        bg-background
        shadow-md
        transition-all
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      {/* 📕 PORTADA */}
      <div className="relative w-full aspect-[3/4]">
        <Image
          src={
            book.coverImageUrl ||
            'https://placehold.co/400x600/EEE/31343C?text=?'
          }
          alt={book.name}
          fill
          className="object-cover"
        />
      </div>

      {/* 📝 INFO */}
      <CardContent className="p-3 space-y-1">
        <h3
          className="
            text-sm
            font-semibold
            leading-tight
            truncate
            text-foreground
          "
          title={book.name}
        >
          {book.name}
        </h3>

        <p className="text-xs text-muted-foreground truncate">
          {book.code}
        </p>
      </CardContent>

      {/* ⚙️ ACCIONES */}
      <CardFooter className="p-2 pt-0">
        <div className="flex w-full justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">
              {isClient ? t('edit_book') : 'Edit'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">
              {isClient ? t('delete_book') : 'Delete'}
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  books,
  onEdit,
  onDelete,
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const { t } = useTranslation();

  if (books.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>{isClient ? t('no_results') : 'No books found.'}</p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-4
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
      "
    >
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

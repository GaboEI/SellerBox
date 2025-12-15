'use client';
import React from 'react';
import { ListingGenerator } from "@/components/listings/listing-generator";
import { PageHeader } from "@/components/shared/page-header";
import { getBooks } from "@/lib/data";
import { useI18n } from '@/components/i18n/i18n-provider';
import type { Book } from '@/lib/types';

export default function ListingsPage() {
    const { t } = useI18n();
    const [books, setBooks] = React.useState<Book[]>([]);

    React.useEffect(() => {
        async function fetchBooks() {
            const booksData = await getBooks();
            setBooks(booksData);
        }
        fetchBooks();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title={t('listing_generator')} description={t('listing_generator_desc')} />
            <ListingGenerator books={books} />
        </div>
    )
}

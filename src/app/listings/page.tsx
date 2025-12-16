'use client';
import React, { useState, useEffect } from 'react';
import { ListingGenerator } from "@/components/listings/listing-generator";
import { PageHeader } from "@/components/shared/page-header";
import { getBooks } from "@/lib/data";
import type { Book } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useTranslation } from 'react-i18next';

export default function ListingsPage() {
    const { t } = useTranslation();
    const [books, setBooks] = React.useState<Book[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    React.useEffect(() => {
        async function fetchBooks() {
            const booksData = await getBooks();
            setBooks(booksData);
        }
        fetchBooks();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 lg:p-6">
                    <div className="flex flex-col gap-8">
                        <PageHeader title={isClient ? t('listing_generator') : 'Listing Generator'} description={isClient ? t('create_compelling_listings') : 'Create compelling product listings for your books.'} />
                        <ListingGenerator books={books} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

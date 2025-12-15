'use client';
import React from 'react';
import { ListingGenerator } from "@/components/listings/listing-generator";
import { PageHeader } from "@/components/shared/page-header";
import { getBooks } from "@/lib/data";
import type { Book } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';

export default function ListingsPage() {
    const [books, setBooks] = React.useState<Book[]>([]);

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
                        <PageHeader title='Listing Generator' description='Create compelling product listings for your books.' />
                        <ListingGenerator books={books} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

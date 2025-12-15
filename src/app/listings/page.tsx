'use client';
import React, { useEffect } from 'react';
import { ListingGenerator } from "@/components/listings/listing-generator";
import { PageHeader } from "@/components/shared/page-header";
import { getBooks } from "@/lib/data";
import { useI18n } from '@/components/i18n/i18n-provider';
import type { Book } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';

export default function ListingsPage() {
    const { t } = useI18n();
    const [books, setBooks] = React.useState<Book[]>([]);
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
        router.push('/login');
        }
    }, [isUserLoading, user, router]);

    React.useEffect(() => {
        if (!user) return;
        async function fetchBooks() {
            const booksData = await getBooks();
            setBooks(booksData);
        }
        fetchBooks();
    }, [user]);
    
    if (isUserLoading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 lg:p-6">
                    <div className="flex flex-col gap-8">
                        <PageHeader title={t('listing_generator')} description={t('listing_generator_desc')} />
                        <ListingGenerator books={books} />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

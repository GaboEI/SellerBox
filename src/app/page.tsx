'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getBooks, getSales } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { PageHeader } from '@/components/shared/page-header';
import { useI18n } from '@/components/i18n/i18n-provider';
import React from 'react';
import type { Book, Sale } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function DashboardPage() {
  const { t } = useI18n();
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth, router]);


  React.useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
    fetchData();
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
            <PageHeader
              title={t('dashboard_title')}
              description={t('dashboard_description')}
            />
            <StatsCards sales={sales} books={books} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SalesChart sales={sales} />
              </div>
              <div className="lg:col-span-1">
                <RecentSales sales={sales} books={books} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { getBooks, getSales } from '@/lib/actions';
import { useEffect, useState } from 'react';
import type { Book, Sale } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { status } = useSession();
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let active = true;
    async function loadData() {
      setIsDataLoading(true);
      const [salesData, booksData] = await Promise.all([
        getSales(),
        getBooks(),
      ]);
      if (!active) return;
      setSales(salesData);
      setBooks(booksData);
      setIsDataLoading(false);
    }
    loadData();
    return () => {
      active = false;
    };
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-48" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-6">
            <PageHeader title={t('dashboard')} description={t('overview')} />
            {isDataLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <StatsCards sales={sales} books={books} />
            )}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {isDataLoading ? (
                  <Skeleton className="h-[360px]" />
                ) : (
                  <SalesChart sales={sales} />
                )}
              </div>
              {isDataLoading ? (
                <Skeleton className="h-[360px]" />
              ) : (
                <RecentSales sales={sales} books={books} />
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

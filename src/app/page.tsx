'use client';

import { getBooks, getSales } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { PageHeader } from '@/components/shared/page-header';
import React, { useState, useEffect } from 'react';
import type { Book, Sale } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [clientKey, setClientKey] = React.useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      const salesData = await getSales();
      const booksData = await getBooks();
      setSales(salesData);
      setBooks(booksData);
    }
    fetchData();
  }, [clientKey]);

  const handleDataChange = React.useCallback(() => {
    setClientKey(prevKey => prevKey + 1);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
            <PageHeader
              title={isClient ? t('dashboard') : 'Dashboard'}
              description={isClient ? t('overview_sales_inventory') : 'An overview of your sales and inventory.'}
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
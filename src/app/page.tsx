import { getBooks, getSales } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { PageHeader } from '@/components/shared/page-header';

export default async function DashboardPage() {
  const sales = await getSales();
  const books = await getBooks();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your sales and inventory."
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
  );
}

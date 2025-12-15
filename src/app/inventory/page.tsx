import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';
import { PageHeader } from '@/components/shared/page-header';

export default async function InventoryPage() {
  const books = await getBooks();

  return (
    <div className="flex flex-col gap-8">
        <PageHeader title="Inventory" description="View and manage your book stock." />
        <CatalogClient books={books} />
    </div>
  )
}

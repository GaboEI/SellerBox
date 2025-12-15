import { getBooks } from '@/lib/data';
import { CatalogClient } from '@/components/catalog/catalog-client';

export default async function CatalogPage() {
  const books = await getBooks();

  return <CatalogClient books={books} />;
}

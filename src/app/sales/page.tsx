import { getSales, getBooks } from '@/lib/data';
import { SalesClient } from '@/components/sales/sales-client';

export default async function SalesPage() {
  const sales = await getSales();
  const books = await getBooks();

  return <SalesClient sales={sales} books={books} />;
}

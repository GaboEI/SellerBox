import { ListingGenerator } from "@/components/listings/listing-generator";
import { PageHeader } from "@/components/shared/page-header";
import { getBooks } from "@/lib/data";

export default async function ListingsPage() {
    const books = await getBooks();
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Listing Generator" description="Create compelling product listings for your books." />
            <ListingGenerator books={books} />
        </div>
    )
}

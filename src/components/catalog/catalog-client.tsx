'use client';
import * as React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { Book } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { addBook } from '@/lib/actions';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Book'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
  resetKey: '',
};

function AddBookForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [state, formAction] = useFormState(addBook, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message.includes('Success')) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      setOpen(false);
      formRef.current?.reset();
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen]);
  
  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Code (Unique)</Label>
        <Input id="code" name="code" required />
        {state.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" defaultValue="0" required />
        {state.errors?.quantity && <p className="text-sm text-destructive">{state.errors.quantity[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <SubmitButton />
    </form>
  );
}

export function CatalogClient({ books }: { books: Book[] }) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');

  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(filter.toLowerCase()) ||
      book.code.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Master Catalog"
        description="Manage your complete book collection."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Book</DialogTitle>
              <DialogDescription>
                Enter the details for the new book to add it to your catalog.
              </DialogDescription>
            </DialogHeader>
            <AddBookForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder="Filter by name or code..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DataTable columns={columns} data={filteredBooks} />
      </Card>
    </div>
  );
}

// Dummy Card component to satisfy the compiler until it's defined elsewhere
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = "Card"

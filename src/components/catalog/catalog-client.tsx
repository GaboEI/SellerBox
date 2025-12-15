'use client';
import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { useToast } from '@/hooks/use-toast';
import { addBook } from '@/lib/actions';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useI18n } from '../i18n/i18n-provider';
import { Card } from '../ui/card';

function SubmitButton() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('adding') : t('add_book_button')}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
  resetKey: '',
};

function AddBookForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(addBook, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message.includes('Success')) {
      toast({
        title: t('success'),
        description: t(state.message),
      });
      setOpen(false);
      formRef.current?.reset();
    } else if (state.message) {
      toast({
        title: t('error'),
        description: t(state.message),
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen, t]);
  
  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">{t('code')} ({t('unique')})</Label>
        <Input id="code" name="code" required />
        {state.errors?.code && <p className="text-sm text-destructive">{t(state.errors.code[0])}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input id="name" name="name" required />
        {state.errors?.name && <p className="text-sm text-destructive">{t(state.errors.name[0])}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">{t('quantity')}</Label>
        <Input id="quantity" name="quantity" type="number" defaultValue="0" required />
        {state.errors?.quantity && <p className="text-sm text-destructive">{t(state.errors.quantity[0])}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea id="description" name="description" />
      </div>
      <SubmitButton />
    </form>
  );
}

export function CatalogClient({ books }: { books: Book[] }) {
  const { t } = useI18n();
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
        title={t('master_catalog')}
        description={t('master_catalog_desc')}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              {t('add_book_button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_book_title')}</DialogTitle>
              <DialogDescription>
                {t('add_new_book_desc')}
              </DialogDescription>
            </DialogHeader>
            <AddBookForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="p-4 sm:p-6">
        <div className="mb-4">
          <Input
            placeholder={t('filter_by_name_or_code')}
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

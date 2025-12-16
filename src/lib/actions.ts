'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  addBook as dbAddBook,
  addSale as dbAddSale,
  getBookByCode,
  getBookById as dbGetBookById,
  updateBook as dbUpdateBook,
  deleteBook as dbDeleteBook,
  updateSale as dbUpdateSale,
  deleteSale as dbDeleteSale,
  getSaleById as dbGetSaleById,
  getBooks as dbGetBooks,
} from './data';
import type { Book, SalePlatform, SaleStatus } from './types';
import { parse } from 'date-fns';

export async function getBooks() {
  return await dbGetBooks();
}

export async function getBookById(id: string) {
    return await dbGetBookById(id);
}

export async function getSaleById(id: string) {
    return await dbGetSaleById(id);
}


const bookSchema = z.object({
  code: z.string().min(1, 'Code is required.'),
  name: z.string().min(1, 'Name is required.'),
  coverImageUrl: z.string().optional(),
});

export async function addBook(prevState: any, formData: FormData) {
  const validatedFields = bookSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    coverImageUrl: formData.get('coverImageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the fields.',
    };
  }

  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook) {
    return {
      errors: { code: ['This code is already in use.'] },
      message: 'Error: Please use a unique code.',
    };
  }

  try {
    await dbAddBook({
      ...validatedFields.data,
      coverImageUrl: validatedFields.data.coverImageUrl || '',
    });
  } catch (e) {
    console.error(e);
    return { message: 'Failed to add book.', errors: {} };
  }

  revalidatePath('/inventory');
  redirect('/inventory');
}

export async function updateBook(id: string, prevState: any, formData: FormData) {
  const validatedFields = bookSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    coverImageUrl: formData.get('coverImageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the fields.',
    };
  }

  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook && existingBook.id !== id) {
    return {
      errors: { code: ['This code is already in use.'] },
      message: 'Error: Please use a unique code.',
    };
  }

  try {
    await dbUpdateBook(id, {
      ...validatedFields.data,
    });
  } catch (e) {
    return { message: 'Failed to update book.', errors: {} };
  }

  revalidatePath('/inventory');
  revalidatePath(`/inventory/edit/${id}`);
  redirect('/inventory');
}

export async function deleteBook(id: string) {
  try {
    await dbDeleteBook(id);
  } catch (e) {
    console.error('Failed to delete book', e);
    return { message: 'Failed to delete book' };
  }
  revalidatePath('/inventory');
}

const saleSchema = z.object({
  bookId: z.string().min(1, 'Please select a book.'),
  date: z.string().min(1, 'Please select a date.'),
  platform: z.enum(['Avito', 'Ozon']),
});

export async function addSale(prevState: any, formData: FormData) {
  const validatedFields = saleSchema.safeParse({
    bookId: formData.get('bookId'),
    date: formData.get('date'),
    platform: formData.get('platform'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the fields.',
    };
  }

  let dateObj: Date;
  try {
    dateObj = parse(validatedFields.data.date, 'dd.MM.yy', new Date());
  } catch (error) {
    return {
      errors: { date: ['The date is invalid. Please use dd.mm.yy format.'] },
      message: 'Error: Please check the fields.',
    };
  }
  
  if (isNaN(dateObj.getTime())) {
    return {
      errors: { date: ['The date is invalid. Please use dd.mm.yy format.'] },
      message: 'Error: Please check the fields.',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj > today) {
    return {
      errors: { date: ['Date cannot be in the future.'] },
      message: 'Error: Please check the fields.',
    };
  }

  try {
    await dbAddSale({
      bookId: validatedFields.data.bookId,
      date: dateObj.toISOString(),
      platform: validatedFields.data.platform as SalePlatform,
    });
  } catch (e) {
    console.error(e);
    return { message: 'Failed to record sale.', errors: {} };
  }

  revalidatePath('/');
  revalidatePath('/sales');
  redirect('/sales');
}

const updateSaleSchema = z.object({
  status: z.enum(['in_process', 'in_preparation', 'shipped', 'sold_in_person', 'completed', 'canceled']),
  saleAmount: z.coerce.number().optional(),
});

export async function updateSale(id: string, prevState: any, formData: FormData) {
  const validatedFields = updateSaleSchema.safeParse({
    status: formData.get('status'),
    saleAmount: formData.get('saleAmount'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the fields.',
    };
  }

  try {
    await dbUpdateSale(id, {
      ...validatedFields.data,
      status: validatedFields.data.status as SaleStatus,
    });
  } catch (e) {
    return { message: 'Failed to update sale.', errors: {} };
  }
  
  revalidatePath('/');
  revalidatePath('/sales');
  revalidatePath(`/sales/edit/${id}`);
  redirect('/sales');
}

export async function deleteSale(id: string) {
    try {
        await dbDeleteSale(id);
    } catch (e) {
        console.error('Failed to delete sale', e);
        return { message: 'failed_to_delete_sale' };
    }
    revalidatePath('/');
    revalidatePath('/sales');
}

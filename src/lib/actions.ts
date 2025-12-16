'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addBook as dbAddBook,
  addSale as dbAddSale,
  getBookByCode,
  updateBook as dbUpdateBook,
  deleteBook as dbDeleteBook,
  updateSale as dbUpdateSale,
  deleteSale as dbDeleteSale,
} from './data';
import type { Book, SalePlatform, SaleStatus } from './types';
import { parse } from 'date-fns';

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
    revalidatePath('/inventory');
    revalidatePath('/catalog');
    return { message: 'add_book_success', errors: {} };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to add book.', errors: {} };
  }
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
    revalidatePath('/inventory');
    revalidatePath('/catalog');
    return { message: 'update_book_success', errors: {} };
  } catch (e) {
    return { message: 'Failed to update book.', errors: {} };
  }
}

export async function deleteBook(id: string) {
  try {
    await dbDeleteBook(id);
    revalidatePath('/inventory');
    revalidatePath('/catalog');
  } catch (e) {
    // Handle error
    console.error('Failed to delete book', e);
  }
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
    revalidatePath('/');
    revalidatePath('/sales');
    return { message: 'add_sale_success', errors: {} };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to record sale.', errors: {} };
  }
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
    revalidatePath('/');
    revalidatePath('/sales');
    return { message: 'update_sale_success', errors: {} };
  } catch (e) {
    return { message: 'Failed to update sale.', errors: {} };
  }
}

export async function deleteSale(id: string, masterKey: string) {
    const MASTER_KEY = "G@bi98072216508";

    if (masterKey !== MASTER_KEY) {
        return { message: 'Clave maestra incorrecta.' };
    }

    try {
        await dbDeleteSale(id);
        revalidatePath('/');
        revalidatePath('/sales');
        return { message: 'delete_sale_success' };
    } catch (e) {
        console.error('Failed to delete sale', e);
        return { message: 'No se pudo eliminar la venta.' };
    }
}

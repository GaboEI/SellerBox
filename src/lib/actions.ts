'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addBook as dbAddBook, addSale as dbAddSale, getBookByCode, updateBook as dbUpdateBook, deleteBook as dbDeleteBook } from './data';
import type { Book, SaleStatus } from './types';

const bookSchema = z.object({
  code: z.string().min(1, 'code_required'),
  name: z.string().min(1, 'name_required'),
  quantity: z.coerce.number().min(0, 'quantity_non_negative'),
  description: z.string().optional(),
});

export async function addBook(prevState: any, formData: FormData) {
  const validatedFields = bookSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    quantity: formData.get('quantity'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'check_fields_error',
    };
  }
  
  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook) {
      return {
          errors: { code: ['code_in_use'] },
          message: 'unique_code_error'
      }
  }

  try {
    await dbAddBook({
        ...validatedFields.data,
        description: validatedFields.data.description || '',
    });
    revalidatePath('/catalog');
    revalidatePath('/inventory');
    return { message: 'add_book_success', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    return { message: 'add_book_fail', errors: {} };
  }
}

export async function updateBook(id: string, prevState: any, formData: FormData) {
  const validatedFields = bookSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    quantity: formData.get('quantity'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'check_fields_error',
    };
  }

  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook && existingBook.id !== id) {
      return {
          errors: { code: ['code_in_use'] },
          message: 'unique_code_error'
      }
  }
  
  try {
    await dbUpdateBook(id, {
        ...validatedFields.data,
        description: validatedFields.data.description || '',
    });
    revalidatePath('/catalog');
    revalidatePath('/inventory');
    revalidatePath('/');
    return { message: 'update_book_success', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    return { message: 'update_book_fail', errors: {} };
  }
}

export async function deleteBook(id: string) {
    try {
        await dbDeleteBook(id);
        revalidatePath('/catalog');
        revalidatePath('/inventory');
        revalidatePath('/');
    } catch(e) {
        // Handle error
        console.error("Failed to delete book", e);
    }
}


const saleSchema = z.object({
    bookId: z.string().min(1, 'select_book_error'),
    date: z.string().min(1, 'date_required_error'),
    status: z.enum(['sold', 'reserved', 'canceled', 'pending']),
    notes: z.string().optional(),
});

export async function addSale(prevState: any, formData: FormData) {
    const validatedFields = saleSchema.safeParse({
        bookId: formData.get('bookId'),
        date: formData.get('date'),
        status: formData.get('status'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'check_fields_error',
        };
    }

    try {
        await dbAddSale({
            ...validatedFields.data,
            status: validatedFields.data.status as SaleStatus,
            notes: validatedFields.data.notes || '',
        });
        revalidatePath('/sales');
        revalidatePath('/');
        revalidatePath('/inventory');
        revalidatePath('/catalog');
        return { message: 'add_sale_success', errors: {}, resetKey: Date.now().toString() };
    } catch(e) {
        return { message: 'add_sale_fail', errors: {} };
    }
}

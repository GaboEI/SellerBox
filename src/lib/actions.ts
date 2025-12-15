'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addBook as dbAddBook, addSale as dbAddSale, getBookByCode, updateBook as dbUpdateBook, deleteBook as dbDeleteBook } from './data';
import type { Book, SaleStatus } from './types';

const bookSchema = z.object({
  code: z.string().min(1, 'Code is required.'),
  name: z.string().min(1, 'Name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be non-negative.'),
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
      message: 'Error: Please check the fields.',
    };
  }
  
  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook) {
      return {
          errors: { code: ['This code is already in use.'] },
          message: 'Error: Please use a unique code.'
      }
  }

  try {
    await dbAddBook({
        ...validatedFields.data,
        description: validatedFields.data.description || '',
    });
    revalidatePath('/catalog');
    revalidatePath('/inventory');
    return { message: 'Successfully added book.', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    return { message: 'Failed to add book.', errors: {} };
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
      message: 'Error: Please check the fields.',
    };
  }

  const existingBook = await getBookByCode(validatedFields.data.code);
  if (existingBook && existingBook.id !== id) {
      return {
          errors: { code: ['This code is already in use.'] },
          message: 'Error: Please use a unique code.'
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
    return { message: 'Successfully updated book.', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    return { message: 'Failed to update book.', errors: {} };
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
    bookId: z.string().min(1, 'Please select a book.'),
    date: z.string().min(1, 'Date is required.'),
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
            message: 'Error: Please check the fields.',
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
        return { message: 'Successfully recorded sale.', errors: {}, resetKey: Date.now().toString() };
    } catch(e) {
        return { message: 'Failed to record sale.', errors: {} };
    }
}

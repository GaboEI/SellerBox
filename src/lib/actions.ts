'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addBook as dbAddBook, addSale as dbAddSale, getBookByCode, updateBook as dbUpdateBook, deleteBook as dbDeleteBook, updateSale as dbUpdateSale } from './data';
import type { Book, SalePlatform, SaleStatus } from './types';

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
    revalidatePath('/inventory');
    revalidatePath('/catalog');
    return { message: 'add_book_success', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    console.error(e);
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
    revalidatePath('/inventory');
    revalidatePath('/catalog');
    return { message: 'update_book_success', errors: {}, resetKey: Date.now().toString() };
  } catch (e) {
    return { message: 'update_book_fail', errors: {} };
  }
}

export async function deleteBook(id: string) {
    try {
        await dbDeleteBook(id);
        revalidatePath('/inventory');
        revalidatePath('/catalog');
    } catch(e) {
        // Handle error
        console.error("Failed to delete book", e);
    }
}

const saleSchema = z.object({
    bookId: z.string().min(1, 'select_book_error'),
    date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, 'date_format_error'),
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
            message: 'check_fields_error',
        };
    }
    
    const [day, month, year] = validatedFields.data.date.split('.');
    const isoDate = `${year}-${month}-${day}`;
    
    // Check if date is valid
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime()) || dateObj.getDate() !== parseInt(day, 10)) {
        return {
            errors: { date: ['invalid_date_error'] },
            message: 'check_fields_error',
        }
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date('2025-01-01');

    if (dateObj < startDate || dateObj > today) {
         return {
            errors: { date: ['date_range_error'] },
            message: 'check_fields_error',
        }
    }


    try {
        await dbAddSale({
            bookId: validatedFields.data.bookId,
            date: dateObj.toISOString(),
            platform: validatedFields.data.platform as SalePlatform,
        });
        revalidatePath('/');
        revalidatePath('/sales');
        return { message: 'add_sale_success', errors: {}, resetKey: Date.now().toString() };
    } catch(e) {
        console.error(e);
        return { message: 'add_sale_fail', errors: {} };
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
            message: 'check_fields_error',
        };
    }

    try {
        await dbUpdateSale(id, {
            ...validatedFields.data,
            status: validatedFields.data.status as SaleStatus,
        });
        revalidatePath('/');
        revalidatePath('/sales');
        return { message: 'update_sale_success', errors: {}, resetKey: Date.now().toString() };
    } catch(e) {
        return { message: 'update_sale_fail', errors: {} };
    }
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
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
  getSales as dbGetSales,
} from './data';
import type { SalePlatform, SaleStatus } from './types';
import { parse } from 'date-fns';

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session.user.id;
}

export async function getBooks() {
  const userId = await requireUserId();
  return await dbGetBooks(userId);
}

export async function getBookById(id: string) {
  const userId = await requireUserId();
  return await dbGetBookById(userId, id);
}

export async function getSaleById(id: string) {
  const userId = await requireUserId();
  return await dbGetSaleById(userId, id);
}

export async function getSales() {
  const userId = await requireUserId();
  return await dbGetSales(userId);
}


const bookSchema = z.object({
  code: z.string().min(1, 'code_required'),
  name: z.string().min(1, 'name_required'),
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
      message: 'check_fields_error',
    };
  }

  const userId = await requireUserId();
  const existingBook = await getBookByCode(userId, validatedFields.data.code);
  if (existingBook) {
    return {
      errors: { code: ['code_in_use_error'] },
      message: 'code_in_use_error',
    };
  }

  try {
    await dbAddBook(userId, {
      ...validatedFields.data,
      coverImageUrl: validatedFields.data.coverImageUrl || '',
    });
  } catch (e) {
    console.error(e);
    return { message: 'failed_to_add_book', errors: {} };
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
      message: 'check_fields_error',
    };
  }

  const userId = await requireUserId();
  const existingBook = await getBookByCode(userId, validatedFields.data.code);
  if (existingBook && existingBook.id !== id) {
    return {
      errors: { code: ['code_in_use_error'] },
      message: 'code_in_use_error',
    };
  }

  try {
    await dbUpdateBook(userId, id, {
      ...validatedFields.data,
    });
  } catch (e) {
    return { message: 'failed_to_update_book', errors: {} };
  }

  revalidatePath('/inventory');
  revalidatePath(`/inventory/edit/${id}`);
  redirect('/inventory');
}

export async function deleteBook(id: string) {
  const userId = await requireUserId();
  try {
    await dbDeleteBook(userId, id);
  } catch (e) {
    console.error('Failed to delete book', e);
    return { message: 'failed_to_delete_book' };
  }
  revalidatePath('/inventory');
}

const saleSchema = z.object({
  bookId: z.string().min(1, 'please_select_a_book'),
  date: z.string().min(1, 'please_select_date'),
  platform: z.enum(['Avito', 'Ozon', 'SellerBox-web'], {
    errorMap: () => ({ message: 'please_select_platform' }),
  }),
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

  let dateObj: Date;
  try {
    dateObj = parse(validatedFields.data.date, 'dd.MM.yy', new Date());
  } catch (error) {
    return {
      errors: { date: ['date_format_error'] },
      message: 'check_fields_error',
    };
  }
  
  if (isNaN(dateObj.getTime())) {
    return {
      errors: { date: ['invalid_date_error'] },
      message: 'check_fields_error',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj > today) {
    return {
      errors: { date: ['date_range_error'] },
      message: 'check_fields_error',
    };
  }

  const userId = await requireUserId();
  try {
    await dbAddSale(userId, {
      bookId: validatedFields.data.bookId,
      date: dateObj.toISOString(),
      platform: validatedFields.data.platform as SalePlatform,
    });
  } catch (e) {
    console.error(e);
    return { message: 'failed_to_record_sale', errors: {} };
  }

  revalidatePath('/dashboard');
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
      message: 'check_fields_error',
    };
  }

  const userId = await requireUserId();
  try {
    await dbUpdateSale(userId, id, {
      ...validatedFields.data,
      status: validatedFields.data.status as SaleStatus,
    });
  } catch (e) {
    return { message: 'failed_to_update_sale', errors: {} };
  }
  
  revalidatePath('/dashboard');
  revalidatePath('/sales');
  revalidatePath(`/sales/edit/${id}`);
  redirect('/sales');
}

export async function deleteSale(id: string) {
    const userId = await requireUserId();
    try {
        await dbDeleteSale(userId, id);
    } catch (e) {
        console.error('Failed to delete sale', e);
        return { message: 'failed_to_delete_sale' };
    }
    revalidatePath('/dashboard');
    revalidatePath('/sales');
}

const updateSaleStatusSchema = z.object({
    status: z.enum(['in_process', 'in_preparation', 'shipped', 'sold_in_person', 'completed', 'canceled']),
});

export async function updateSaleStatus(id: string, newStatus: SaleStatus) {
    const validatedFields = updateSaleStatusSchema.safeParse({ status: newStatus });
    
    if (!validatedFields.success) {
        return { error: 'invalid_status_value' };
    }

    try {
        const userId = await requireUserId();
        const result = await dbUpdateSale(userId, id, { status: newStatus });
        if (!result) {
            return { error: 'sale_not_found' };
        }
    } catch (e: any) {
        console.error('Failed to update sale status', e);
        return { error: 'failed_to_update_sale_status' };
    }

    revalidatePath('/sales');
    revalidatePath('/dashboard');
    return { success: true };
}

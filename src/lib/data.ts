'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Book, Sale } from './types';

// Use path.join to create a platform-independent file path.
const booksFilePath = path.join(process.cwd(), 'src/lib/books.json');
const salesFilePath = path.join(process.cwd(), 'src/lib/sales.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    // Ensure the directory exists.
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // Try to read the file.
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    // If the file doesn't exist (ENOENT), it's the first run. Write an empty array and return it.
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    console.error(`Error reading data from ${filePath}:`, error);
    throw error;
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw error;
  }
}

// --- Books ---

export async function getBooks(): Promise<Book[]> {
  return await readData<Book>(booksFilePath);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.id === id);
}

export async function getBookByCode(code: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.code === code);
}

export async function addBook(book: Omit<Book, 'id'>): Promise<Book> {
  const books = await getBooks();
  const newBook: Book = { ...book, id: String(Date.now()) };
  // Add to the end of the array to avoid race conditions.
  const updatedBooks = [...books, newBook];
  await writeData(booksFilePath, updatedBooks);
  return newBook;
}

export async function updateBook(id: string, updates: Partial<Omit<Book, 'id'>>): Promise<Book | null> {
  let books = await getBooks();
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) return null;

  const updatedBook = { ...books[bookIndex], ...updates };
  books[bookIndex] = updatedBook;
  await writeData(booksFilePath, books);
  return updatedBook;
}

export async function deleteBook(id: string): Promise<void> {
  let books = await getBooks();
  const updatedBooks = books.filter((book) => book.id !== id);
  await writeData(booksFilePath, updatedBooks);
}

// --- Sales ---

export async function getSales(): Promise<Sale[]> {
  const sales = await readData<any>(salesFilePath);
  // Dates are stored as strings in JSON, so we need to convert them back to Date objects.
  return sales.map(sale => ({
    ...sale,
    date: new Date(sale.date),
  }));
}

export async function addSale(sale: Omit<Sale, 'id' | 'status' | 'date'> & { date: string }): Promise<Sale> {
  const sales = await getSales();
  const newSale: Sale = { 
    ...sale, 
    id: `s${Date.now()}`, 
    date: new Date(sale.date), 
    status: 'in_process' 
  };
  
  const book = await getBookById(sale.bookId);
  if (book && (newSale.status === 'completed' || newSale.status === 'sold_in_person')) {
    await updateBook(book.id, { quantity: book.quantity - 1 });
  }

  // Add to the end of the array.
  const updatedSales = [...sales, newSale];
  await writeData(salesFilePath, updatedSales as any);
  return newSale;
}

export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null> {
    let sales = await getSales();
    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return null;

    const originalStatus = sales[saleIndex].status;
    const newStatus = updates.status;

    const updatedSale = { ...sales[saleIndex], ...updates };
    
    const isNowSold = newStatus === 'completed' || newStatus === 'sold_in_person';
    const wasNotSold = originalStatus !== 'completed' && originalStatus !== 'sold_in_person';
    
    if (isNowSold && wasNotSold) {
        const book = await getBookById(updatedSale.bookId);
        if (book) {
            await updateBook(book.id, { quantity: Math.max(0, book.quantity - 1) });
        }
    }

    sales[saleIndex] = updatedSale;
    await writeData(salesFilePath, sales);
    
    // Return with Date object
    return { ...updatedSale, date: new Date(updatedSale.date) };
}

export async function getSalesByBookId(bookId: string): Promise<Sale[]> {
  const sales = await getSales();
  return sales.filter(sale => sale.bookId === bookId);
}

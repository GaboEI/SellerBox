'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Book, Sale, UserProfile as UserProfileType } from './types';
import { PlaceHolderImages } from './placeholder-images';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { User } from 'firebase/auth';

// This is a workaround to initialize Firebase on the server-side for Server Actions.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const firestore = getFirestore(app);

// Use path.join to create a platform-independent file path.
const booksFilePath = path.join(process.cwd(), 'src/lib/books.json');
const salesFilePath = path.join(process.cwd(), 'src/lib/sales.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
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
  const newBook: Book = {
    ...book,
    id: String(Date.now()),
    coverImageUrl:
      book.coverImageUrl ||
      PlaceHolderImages.find((p) => p.id === 'default_book_cover')?.imageUrl,
  };
  const updatedBooks = [...books, newBook];
  await writeData(booksFilePath, updatedBooks);
  return newBook;
}
export async function updateBook(
  id: string,
  updates: Partial<Omit<Book, 'id'>>
): Promise<Book | null> {
  let books = await getBooks();
  const bookIndex = books.findIndex((b) => b.id === id);
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
  return sales.map((sale) => ({
    ...sale,
    date: new Date(sale.date),
  }));
}
export async function getSaleById(id: string): Promise<Sale | undefined> {
    const sales = await getSales();
    return sales.find((sale) => sale.id === id);
}
export async function addSale(
  sale: Omit<Sale, 'id' | 'status' | 'date'> & { date: string }
): Promise<Sale> {
  const sales = await getSales();
  const newSale: Sale = {
    ...sale,
    id: `s${Date.now()}`,
    date: new Date(sale.date),
    status: 'in_process',
  };

  const book = await getBookById(sale.bookId);
  if (
    book &&
    (newSale.status === 'completed' || newSale.status === 'sold_in_person')
  ) {
    // await updateBook(book.id, { quantity: book.quantity - 1 });
  }

  const updatedSales = [...sales, newSale];
  await writeData(salesFilePath, updatedSales as any);
  return newSale;
}
export async function updateSale(
  id: string,
  updates: Partial<Sale>
): Promise<Sale | null> {
  let sales = await getSales();
  const saleIndex = sales.findIndex((s) => s.id === id);
  if (saleIndex === -1) return null;

  const originalStatus = sales[saleIndex].status;
  const newStatus = updates.status;

  const updatedSale = { ...sales[saleIndex], ...updates };

  const isNowSold =
    newStatus === 'completed' || newStatus === 'sold_in_person';
  const wasNotSold =
    originalStatus !== 'completed' && originalStatus !== 'sold_in_person';

  if (isNowSold && wasNotSold) {
    const book = await getBookById(updatedSale.bookId);
    if (book) {
      // await updateBook(book.id, { quantity: Math.max(0, book.quantity - 1) });
    }
  }

  sales[saleIndex] = updatedSale;
  await writeData(salesFilePath, sales);

  return { ...updatedSale, date: new Date(updatedSale.date) };
}
export async function getSalesByBookId(bookId: string): Promise<Sale[]> {
  const sales = await getSales();
  return sales.filter((sale) => sale.bookId === bookId);
}
export async function deleteSale(id: string): Promise<void> {
    let sales = await getSales();
    const updatedSales = sales.filter((sale) => sale.id !== id);
    await writeData(salesFilePath, updatedSales);
}


// --- User Profile ---
export async function getUserProfile(db: Firestore, user: User | null): Promise<UserProfileType | null> {
  if (!user) {
    return null;
  }

  const userDocRef = doc(db, 'users', user.uid);

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfileType;
    } else {
      const defaultProfile: UserProfileType = {
        username: user.displayName || 'New Seller',
        photoUrl:
          user.photoURL ||
          PlaceHolderImages.find((p) => p.id === 'default_user_profile')
            ?.imageUrl,
      };
      // This might fail if the user doesn't have permission, but the error
      // will be caught and handled below.
      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    // For reads, we can't create a detailed client-side error from the server,
    // so we'll just log it for now. The primary fix will be in write operations.
    console.error("Permission error in getUserProfile:", error);
    return null;
  }
}

'use server';

import type { Book, Sale, UserProfile as UserProfileType } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { prisma } from '@/lib/prisma';
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

// Server-side Firebase init for profile storage.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const firestore = getFirestore(app);

// --- Books ---
export async function getBooks(userId: string): Promise<Book[]> {
  return prisma.book.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getBookById(
  userId: string,
  id: string
): Promise<Book | undefined> {
  return prisma.book.findFirst({
    where: { id, userId },
  }) as Promise<Book | undefined>;
}

export async function getBookByCode(
  userId: string,
  code: string
): Promise<Book | undefined> {
  return prisma.book.findFirst({
    where: { code, userId },
  }) as Promise<Book | undefined>;
}

export async function addBook(
  userId: string,
  book: Omit<Book, 'id' | 'userId'>
): Promise<Book> {
  const coverImageUrl =
    book.coverImageUrl ||
    PlaceHolderImages.find((p) => p.id === 'default_book_cover')?.imageUrl ||
    null;

  return prisma.book.create({
    data: {
      userId,
      code: book.code,
      name: book.name,
      coverImageUrl,
    },
  });
}

export async function updateBook(
  userId: string,
  id: string,
  updates: Partial<Omit<Book, 'id' | 'userId'>>
): Promise<Book | null> {
  const existing = await prisma.book.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.book.update({
    where: { id },
    data: {
      code: updates.code ?? existing.code,
      name: updates.name ?? existing.name,
      coverImageUrl: updates.coverImageUrl ?? existing.coverImageUrl,
    },
  });
}

export async function deleteBook(userId: string, id: string): Promise<void> {
  await prisma.book.deleteMany({ where: { id, userId } });
}

// --- Sales ---
export async function getSales(userId: string): Promise<Sale[]> {
  return prisma.sale.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function getSaleById(
  userId: string,
  id: string
): Promise<Sale | undefined> {
  return prisma.sale.findFirst({
    where: { id, userId },
  }) as Promise<Sale | undefined>;
}
export async function addSale(
  userId: string,
  sale: Omit<Sale, 'id' | 'status' | 'date' | 'userId'> & { date: string }
): Promise<Sale> {
  return prisma.sale.create({
    data: {
      userId,
      bookId: sale.bookId,
      date: new Date(sale.date),
      status: 'in_process',
      platform: sale.platform,
      saleAmount: sale.saleAmount ?? null,
    },
  });
}
export async function updateSale(
  userId: string,
  id: string,
  updates: Partial<Sale>
): Promise<Sale | null> {
  const existing = await prisma.sale.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.sale.update({
    where: { id },
    data: {
      status: updates.status ?? existing.status,
      saleAmount:
        typeof updates.saleAmount === 'number'
          ? updates.saleAmount
          : existing.saleAmount,
    },
  });
}
export async function getSalesByBookId(
  userId: string,
  bookId: string
): Promise<Sale[]> {
  return prisma.sale.findMany({
    where: { bookId, userId },
    orderBy: { date: 'desc' },
  });
}
export async function deleteSale(userId: string, id: string): Promise<void> {
  await prisma.sale.deleteMany({ where: { id, userId } });
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

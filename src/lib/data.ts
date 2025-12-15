import type { Book, Sale, SaleStatus, SalePlatform } from './types';

let books: Book[] = [
  { id: '1', code: '978-0321765723', name: 'The C++ Programming Language', quantity: 10, description: 'The foundational text by Bjarne Stroustrup.' },
  { id: '2', code: '978-0132350884', name: 'Clean Code: A Handbook of Agile Software Craftsmanship', quantity: 5, description: 'A must-read for every developer.' },
  { id: '3', code: '978-0201633610', name: 'Design Patterns: Elements of Reusable Object-Oriented Software', quantity: 8, description: 'The classic "Gang of Four" book.' },
  { id: '4', code: '978-0596007126', name: 'JavaScript: The Good Parts', quantity: 12, description: 'Unearthing the elegance of JavaScript.' },
  { id: '5', code: '978-1491904244', name: 'You Don\'t Know JS: Up & Going', quantity: 2, description: 'A primer for the popular "You Don\'t Know JS" series.' },
];

let sales: Sale[] = [
    { id: 's1', bookId: '1', date: new Date('2024-05-01'), status: 'completed', platform: 'Avito', saleAmount: 2600 },
    { id: 's2', bookId: '2', date: new Date('2024-05-02'), status: 'completed', platform: 'Ozon', saleAmount: 2500 },
    { id: 's3', bookId: '3', date: new Date('2024-05-02'), status: 'in_preparation', platform: 'Avito' },
    { id: 's4', bookId: '1', date: new Date('2024-05-03'), status: 'sold_in_person', platform: 'Ozon', saleAmount: 2400 },
    { id: 's5', bookId: '4', date: new Date('2024-05-04'), status: 'canceled', platform: 'Avito' },
    { id: 's6', bookId: '5', date: new Date('2024-05-10'), status: 'shipped', platform: 'Ozon' },
    { id: 's7', bookId: '2', date: new Date('2024-05-11'), status: 'in_process', platform: 'Avito' },
];

// --- Books ---

export async function getBooks(): Promise<Book[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));
  return books;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return books.find((book) => book.id === id);
}

export async function getBookByCode(code: string): Promise<Book | undefined> {
    return books.find((book) => book.code === code);
}

export async function addBook(book: Omit<Book, 'id'>): Promise<Book> {
  const newBook: Book = { ...book, id: String(Date.now()) };
  books = [newBook, ...books];
  return newBook;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    let bookToUpdate = books.find(b => b.id === id);
    if (!bookToUpdate) return null;

    bookToUpdate = { ...bookToUpdate, ...updates };
    books = books.map(b => (b.id === id ? bookToUpdate! : b));
    return bookToUpdate;
}

export async function deleteBook(id: string): Promise<void> {
  books = books.filter((book) => book.id !== id);
}

// --- Sales ---

export async function getSales(): Promise<Sale[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));
  return sales;
}

export async function addSale(sale: Omit<Sale, 'id' | 'date' | 'status'> & { date: string }): Promise<Sale> {
  const newSale: Sale = { ...sale, id: `s${Date.now()}`, date: new Date(sale.date), status: 'in_process' };
  
  const book = await getBookById(sale.bookId);
  if (book && (newSale.status === 'completed' || newSale.status === 'sold_in_person')) {
    await updateBook(book.id, { quantity: book.quantity - 1 });
  }

  sales = [newSale, ...sales];
  return newSale;
}

export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null> {
    let saleToUpdate = sales.find(s => s.id === id);
    if (!saleToUpdate) return null;

    const originalStatus = saleToUpdate.status;
    const newStatus = updates.status;

    saleToUpdate = { ...saleToUpdate, ...updates };
    
    // Decrement book quantity if status changes to a sold state
    const isNowSold = newStatus === 'completed' || newStatus === 'sold_in_person';
    const wasNotSold = originalStatus !== 'completed' && originalStatus !== 'sold_in_person';
    
    if (isNowSold && wasNotSold) {
        const book = await getBookById(saleToUpdate.bookId);
        if (book) {
            await updateBook(book.id, { quantity: Math.max(0, book.quantity - 1) });
        }
    }

    sales = sales.map(s => (s.id === id ? saleToUpdate! : s));
    return saleToUpdate;
}

export async function getSalesByBookId(bookId: string): Promise<Sale[]> {
  return sales.filter(sale => sale.bookId === bookId);
}

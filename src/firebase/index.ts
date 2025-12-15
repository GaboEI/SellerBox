'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, doc } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// --- SERVICE GETTERS ---
// These functions are designed to be idempotent, meaning they will only initialize
// the Firebase app once, even if called multiple times.

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);
const storage: FirebaseStorage = getStorage(firebaseApp);

/**
 * A function that returns all initialized Firebase services.
 * This is the primary entry point for accessing Firebase services in a client component.
 */
export function initializeFirebase() {
  // Since services are initialized above, we just return them.
  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}


// --- HOOKS & PROVIDERS ---
// Re-exporting hooks and providers for easy access throughout the app.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';

// --- FIRESTORE & STORAGE HELPERS ---
// Re-exporting common SDK functions for convenience.
export { doc, getStorage };

'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

/**
 * A function that returns all initialized Firebase services.
 * This is the primary entry point for accessing Firebase services in a client component.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

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
export * from './errors';
export * from './error-emitter';

// --- FIRESTORE & STORAGE HELPERS ---
// Re-exporting common SDK functions for convenience.
export { doc } from 'firebase/firestore';
export { getStorage } from 'firebase/storage';

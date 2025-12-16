'use client';

import { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase on the client-side and provides it to children components.
 * This component ensures that Firebase is initialized only once.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp, auth, firestore, storage } = useMemo(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
}

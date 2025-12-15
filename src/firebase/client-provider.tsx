'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore, storage } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Este proveedor pasa las instancias de Firebase ya inicializadas
  // al contexto para que estén disponibles en toda la aplicación.
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

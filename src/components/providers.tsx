'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { FirebaseProvider, initializeFirebase } from '@/firebase'; // Corrected import

// Initialize Firebase correctly
const firebaseProviders = initializeFirebase();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <FirebaseProvider {...firebaseProviders}>
        {children}
      </FirebaseProvider>
    </SessionProvider>
  );
}

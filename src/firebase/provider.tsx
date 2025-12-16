'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, type User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(
    () => ({
      firebaseApp,
      firestore,
      auth,
      storage,
      user,
      isUserLoading,
    }),
    [firebaseApp, firestore, auth, storage, user, isUserLoading]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

/** Hook to access the authenticated user. */
export const useUser = (): { user: User | null; isUserLoading: boolean } => {
    const { user, isUserLoading } = useFirebase();
    return { user, isUserLoading };
}

/** Hook to access the Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  return useFirebase().auth;
};

/** Hook to access the Firestore instance. */
export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
};

/** Hook to access the Firebase Storage instance. */
export const useStorage = (): FirebaseStorage | null => {
  return useFirebase().storage;
};

/** Hook to access the Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().firebaseApp;
};

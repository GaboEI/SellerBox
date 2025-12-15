'use client';

import { useFirebase } from '@/firebase/provider';
import type { User } from 'firebase/auth';

export function useUser(): { user: User | null; isUserLoading: boolean } {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
}

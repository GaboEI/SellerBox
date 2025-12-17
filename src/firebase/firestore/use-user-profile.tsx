'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc } from './use-doc';
import { useUser } from '../provider';
import { useFirestore } from '../provider';
import type { UserProfile } from '@/lib/types';

export function useUserProfile() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  return { profile, isProfileLoading };
}

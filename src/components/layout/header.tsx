'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/components/i18n/i18n-provider';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function AppHeader() {
  const { t } = useI18n();
  const auth = useAuth();
  const firestore = useFirestore();
  const userId = auth?.currentUser?.uid;

  const userDocRef = useMemoFirebase(
    () => {
      if (!firestore || !userId) return null;
      return doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
    },
    [firestore, userId]
  );
  
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const defaultProfilePic = PlaceHolderImages.find(p => p.id === 'default_user_profile')?.imageUrl || '';
  
  const username = userProfile?.username || "Seller";
  const photoUrl = userProfile?.photoUrl || defaultProfilePic;
  const usernameInitial = username?.[0]?.toUpperCase() || 'S';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex-1">
        {/* Future elements can go here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {isLoading ? (
                <Skeleton className="h-9 w-9 rounded-full" />
            ) : (
                <Avatar className="h-9 w-9">
                <AvatarImage
                    src={photoUrl}
                    alt="User Avatar"
                />
                <AvatarFallback>{usernameInitial}</AvatarFallback>
                </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                seller@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

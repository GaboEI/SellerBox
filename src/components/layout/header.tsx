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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useUser, useUserProfile } from '@/firebase';
import { useTranslation } from 'react-i18next';


export function AppHeader() {
  const { t } = useTranslation();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { profile, isProfileLoading } = useUserProfile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultProfilePic = PlaceHolderImages.find(p => p.id === 'default_user_profile')?.imageUrl || '';
  const username = profile?.username || user?.displayName || "Seller";
  const userEmail = user?.email || "seller@example.com";

  // Cache-busting for user profile photo
  const userPhoto = profile?.photoUrl 
    ? `${profile.photoUrl}?updatedAt=${profile.updatedAt?.seconds || ''}` 
    : user?.photoURL || defaultProfilePic;

  const usernameInitial = username?.[0]?.toUpperCase() || 'S';

  const isUserLoading = isAuthLoading || isProfileLoading;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex-1">
        {/* Future elements can go here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              {isUserLoading ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <>
                  <AvatarImage
                      src={userPhoto}
                      alt="User Avatar"
                  />
                  <AvatarFallback>{usernameInitial}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{isClient ? t('settings') : 'Settings'}</span>
              </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

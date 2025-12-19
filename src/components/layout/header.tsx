'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
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
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

export function AppHeader() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isUserLoading = status === 'loading';

  const username = session?.user?.name || "Seller";
  const userEmail = session?.user?.email || "seller@example.com";
  const usernameInitial = username?.[0]?.toUpperCase() || 'S';

  // Cache-busting for the profile picture.
  const userPhoto = session?.user?.image 
    ? `${session.user.image}?v=${session.user.updatedAt || new Date().getTime()}`
    : '';

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
                      alt={`${username}'s Avatar`}
                  />
                  <AvatarFallback>{usernameInitial}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {session?.user ? (
            <>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                 <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => signIn()}>
               <span>Log In</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

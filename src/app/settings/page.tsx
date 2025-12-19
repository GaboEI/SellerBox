'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { LanguageToggle } from '@/components/i18n/language-toggle';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, doc, useDoc } from '@/firebase';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: session, status, update } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoUrlDataUri, setPhotoUrlDataUri] = useState<string>('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userDocRef = useMemo(() => {
    if (!firestore || !session?.user?.email) return null;
    return doc(firestore, 'users', session.user.email);
  }, [firestore, session]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    userDocRef
  );

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  if (status === 'loading') {
    return <div>{t('loading')}</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setPhotoUrlDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (status !== 'authenticated') {
      toast({ title: t('error'), description: t('must_be_logged_in'), variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          photoUrl: photoUrlDataUri || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      await update();

      toast({ title: t('success'), description: t('profile_updated') });
      setImagePreview(null);
      setPhotoUrlDataUri('');

    } catch (e: any) {
      console.error("SAVE_PROFILE_ERROR:", e);
      toast({
        title: t('error'),
        description: e.message || t('could_not_update_profile'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => signOut({ callbackUrl: '/login' });

  const defaultProfilePic =
    PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl || '';

  const isLoading = isProfileLoading;
  const currentPhoto = imagePreview || profile?.photoUrl || defaultProfilePic;
  const currentUsername = profile?.username || '';
  const fallbackInitial = currentUsername?.[0]?.toUpperCase() || 'S';
  const canSave = status === 'authenticated' && !isSaving;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
            <PageHeader
              title={isClient ? t('settings') : 'Settings'}
              description={isClient ? t('customize_your_experience') : 'Customize your experience.'}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{isClient ? t('appearance') : 'Appearance'}</CardTitle>
                    <CardDescription>{isClient ? t('adjust_look_and_feel') : 'Adjust the look and feel of the application.'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme">{isClient ? t('theme') : 'Theme'}</Label>
                      <ThemeToggle />
                    </div>
                     <div className="flex items-center justify-between">
                      <Label htmlFor="language">{isClient ? t('language') : 'Language'}</Label>
                      <LanguageToggle />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <form onSubmit={handleSave}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{isClient ? t('account') : 'Account'}</CardTitle>
                      <CardDescription>
                        {isLoading
                          ? t('loading_profile')
                          : (isClient ? t('manage_profile_info') : 'Manage your profile information and account settings.')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isLoading ? (
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-20 w-20 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage
                              src={currentPhoto}
                              alt={currentUsername}
                            />
                            <AvatarFallback>{fallbackInitial}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <Label htmlFor="photoUrl">
                              {isClient ? t('profile_picture') : 'Profile picture'}
                            </Label>
                             <div className="relative">
                                <Button type="button" variant="outline" className="relative">
                                {isClient ? t('change') : 'Change'}
                                <Input
                                    id="photoUrl"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="username">{isClient ? t('username') : 'Username'}</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                       <div className="flex w-full justify-between">
                         <Button type="submit" disabled={!canSave} className="w-full sm:w-auto">
                           {isSaving ? t('saving') : (isClient ? t('save_changes') : 'Save Changes')}
                         </Button>
                        <Button variant="outline" onClick={handleSignOut} disabled={status !== 'authenticated'}>
                          {isClient ? t('sign_out') : 'Sign Out'}
                        </Button>
                       </div>
                    </CardFooter>
                  </Card>
                </form>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

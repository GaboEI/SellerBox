'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import { LanguageToggle } from '@/components/i18n/language-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useI18n } from '@/components/i18n/i18n-provider';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from '@/components/settings/theme-toggle';

const USER_ID = 'default_user';

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', USER_ID) : null),
    [firestore]
  );

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [username, setUsername] = useState('Seller');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultProfilePic =
    PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl ||
    '';

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || 'Seller');
      // No need to set imagePreview here; Avatar will handle it.
    }
  }, [userProfile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database connection not available.',
      });
      return;
    }
    setIsSaving(true);
    try {
      let newPhotoUrl = userProfile?.photoUrl;

      if (selectedFile) {
        const storage = getStorage();
        // Use a consistent file name for the user's profile picture
        const storageRef = ref(storage, `profile-pictures/${USER_ID}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        newPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      const updatedProfile: UserProfile = {
        username: username,
        photoUrl: newPhotoUrl,
      };
      
      if(userDocRef){
        await setDoc(userDocRef, updatedProfile, { merge: true });
      }

      toast({
        title: t('profile_update_success'),
      });
      setImagePreview(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: t('profile_update_fail'),
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const displayImageUrl = imagePreview || userProfile?.photoUrl || defaultProfilePic;
  const usernameInitial = username?.[0]?.toUpperCase() || 'S';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
            <PageHeader
              title={t('settings')}
              description={t('settings_desc')}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('appearance')}</CardTitle>
                    <CardDescription>{t('appearance_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme">{t('theme')}</Label>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="language">{t('language')}</Label>
                      <LanguageToggle />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('account')}</CardTitle>
                    <CardDescription>{t('account_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={displayImageUrl}
                          alt={username}
                        />
                        <AvatarFallback>{usernameInitial}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                         <Label htmlFor="picture-upload">{t('profile_picture')}</Label>
                        <Input
                          id="picture-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('username')}</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                     <Button onClick={handleSaveChanges} disabled={isSaving}>
                      {isSaving ? t('saving') : t('save_changes')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

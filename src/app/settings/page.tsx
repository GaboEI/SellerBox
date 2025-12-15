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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const [username, setUsername] = useState('Seller');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultProfilePic =
    PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl ||
    '';

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || 'Seller');
    }
  }, [userProfile]);

  const handleFileChangeAndSave = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    if (!firestore || !userDocRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database connection not available.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${USER_ID}`);
      const snapshot = await uploadBytes(storageRef, file);
      const newPhotoUrl = await getDownloadURL(snapshot.ref);

      // Update Firestore
      const updatedProfile: UserProfile = {
        username: username, // keep the existing username
        photoUrl: newPhotoUrl,
      };
      
      await setDoc(userDocRef, updatedProfile, { merge: true });

      toast({
        title: t('profile_update_success'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: t('profile_update_fail'),
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      // Revert preview if upload fails
      setImagePreview(null);
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
                          onChange={handleFileChangeAndSave}
                          className="max-w-xs"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('username')}</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
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

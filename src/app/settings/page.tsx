'use client';

import React from 'react';
import { useActionState, useFormStatus } from 'react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/actions';
import { useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? t('saving') : t('save_changes')}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: {},
};

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateUserProfile, initialState);

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

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState('');
  
  const defaultProfilePic = PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl || '';
  
  React.useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || 'Seller');
      setImagePreview(userProfile.photoUrl || defaultProfilePic);
    } else {
      setImagePreview(defaultProfilePic);
    }
  }, [userProfile, defaultProfilePic]);

  React.useEffect(() => {
    if (state.message) {
      if (state.message.includes('success')) {
        toast({ title: t('success'), description: t(state.message) });
      } else {
        toast({ title: t('error'), description: t(state.message), variant: 'destructive' });
      }
    }
  }, [state, toast, t]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
                <form action={formAction}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('account')}</CardTitle>
                      <CardDescription>{t('account_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isLoading ? (
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-60" />
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={imagePreview || defaultProfilePic} alt={username} />
                            <AvatarFallback>{username?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Label htmlFor="profile-picture-upload">{t('profile_picture')}</Label>
                            <Input id="profile-picture-upload" name="photoUrl" type="file" accept="image/*" className="mt-2 max-w-xs" onChange={handleImageChange} />
                            <input type="hidden" name="photoUrlDataUri" value={imagePreview || ''} />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="username">{t('username')}</Label>
                         {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                         ) : (
                            <Input
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                         )}
                      </div>
                    </CardContent>
                    <div className="flex justify-end p-6 pt-0">
                       <SubmitButton />
                    </div>
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

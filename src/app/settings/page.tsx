'use client';

import React, { useEffect, useState, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/shared/page-header';
import { LanguageToggle } from '@/components/i18n/language-toggle';
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
import { useI18n } from '@/components/i18n/i18n-provider';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserProfile, updateUserProfile } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

function SubmitButton() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? t('saving') : t('save_changes')}
    </Button>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoUrlDataUri, setPhotoUrlDataUri] = useState<string>('');
  
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(updateUserProfile, {
    status: '',
    message: '',
    errors: {},
  });

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      setIsLoading(false);
    }
    fetchProfile();
  }, [state]); // Refetch profile on successful save

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: t('success'),
        description: t(state.message),
      });
      // Reset form state after successful submission if needed
      setPhotoUrlDataUri('');
      setImagePreview(null);
    } else if (state.status === 'error') {
      toast({
        title: t('error'),
        description: t(state.message),
        variant: 'destructive',
      });
    }
  }, [state, toast, t]);

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

  const defaultProfilePic = PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl || '';

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
                <form ref={formRef} action={formAction}>
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
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={imagePreview || profile?.photoUrl || defaultProfilePic} alt={profile?.username} />
                            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <Label htmlFor="photoUrl">{t('profile_picture')}</Label>
                            <Input id="photoUrl" type="file" accept="image/*" onChange={handleFileChange} className="max-w-xs" />
                            <input type="hidden" name="photoUrlDataUri" value={photoUrlDataUri} />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="username">{t('username')}</Label>
                         {isLoading ? (
                           <Skeleton className="h-10 w-full" />
                         ) : (
                          <Input id="username" name="username" defaultValue={profile?.username || ''} required />
                         )}
                         {state.errors?.username && <p className="text-sm text-destructive">{t(state.errors.username[0] as string)}</p>}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <SubmitButton />
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

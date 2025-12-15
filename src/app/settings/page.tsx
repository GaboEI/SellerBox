'use client';

import React, { useEffect, useState, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { updateUserProfile } from '@/lib/actions';
import { getUserProfile } from '@/lib/data';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

const initialState = {
    status: '',
    message: '',
    errors: {},
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoUrlDataUri, setPhotoUrlDataUri] = useState<string>('');

  const formRef = useRef<HTMLFormElement>(null);
  
  const updateUserProfileAction = async (prevState: any, formData: FormData) => {
    if (!user) {
      return {
        status: 'error',
        message: 'You must be logged in to update your profile.',
      };
    }
    return updateUserProfile(user.uid, prevState, formData);
  };
  
  const [state, formAction] = useActionState(updateUserProfileAction, initialState);

  useEffect(() => {
    async function fetchProfile() {
      if (isUserLoading || !firestore || !user) return;
      setIsLoading(true);
      const userProfile = await getUserProfile(firestore, user);
      setProfile(userProfile);
      setIsLoading(false);
    }
    fetchProfile();
  }, [user, isUserLoading, firestore]);

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Success!',
        description: 'Profile updated successfully.',
      });
      setPhotoUrlDataUri('');
      setImagePreview(null);
    } else if (state.status === 'error' && state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

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

  const defaultProfilePic =
    PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl ||
    '';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="flex flex-col gap-8">
            <PageHeader
              title='Settings'
              description='Customize your experience.'
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Adjust the look and feel of the application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme">Theme</Label>
                      <ThemeToggle />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <form ref={formRef} action={formAction}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>Manage your profile information and account settings.</CardDescription>
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
                              src={
                                imagePreview ||
                                profile?.photoUrl ||
                                user?.photoURL ||
                                defaultProfilePic
                              }
                              alt={profile?.username || user?.displayName || ''}
                            />
                            <AvatarFallback>
                              {profile?.username?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <Label htmlFor="photoUrl">
                              Profile picture
                            </Label>
                            <Input
                              id="photoUrl"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="max-w-xs"
                            />
                            <input
                              type="hidden"
                              name="photoUrlDataUri"
                              value={photoUrlDataUri}
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input
                            id="username"
                            name="username"
                            defaultValue={profile?.username || user?.displayName || ''}
                            required
                          />
                        )}
                        {(state.errors as any)?.username && (
                          <p className="text-sm text-destructive">
                            {(state.errors as any).username[0] as string}
                          </p>
                        )}
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

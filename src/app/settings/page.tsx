'use client';

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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserProfile } from '@/lib/data';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, doc, useDoc, setDoc } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoUrlDataUri, setPhotoUrlDataUri] = useState<string>('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || user?.displayName || '');
    }
  }, [profile, user]);

  useEffect(() => {
    async function fetchProfile() {
      if (isUserLoading || !firestore || !user || profile !== undefined) return;
      await getUserProfile(firestore, user);
    }
    fetchProfile();
  }, [user, isUserLoading, firestore, profile]);

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
    if (!user || !firestore) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    if (!username) {
        toast({ title: 'Error', description: 'Username is required.', variant: 'destructive' });
        return;
    }

    setIsSaving(true);
    
    try {
      const updates: Partial<UserProfile> = { username };
      if (photoUrlDataUri) {
        updates.photoUrl = photoUrlDataUri;
      }
      
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Using a non-blocking update
      setDocumentNonBlocking(userDocRef, updates, { merge: true });

      toast({
        title: 'Success!',
        description: 'Profile update in progress.',
      });
      setImagePreview(null);
      setPhotoUrlDataUri('');

    } catch (e: any) {
        // Errors will be caught by the non-blocking helper's catch block
    } finally {
      setIsSaving(false);
    }
  };

  const defaultProfilePic =
    PlaceHolderImages.find((p) => p.id === 'default_user_profile')?.imageUrl || '';

  const isLoading = isUserLoading || isProfileLoading;
  const currentPhoto = imagePreview || profile?.photoUrl || user?.photoURL || defaultProfilePic;
  const currentUsername = profile?.username || user?.displayName || '';
  const fallbackInitial = currentUsername?.[0]?.toUpperCase() || 'S';

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
                <form onSubmit={handleSave}>
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
                              src={currentPhoto}
                              alt={currentUsername}
                            />
                            <AvatarFallback>{fallbackInitial}</AvatarFallback>
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                       <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                         {isSaving ? 'Saving...' : 'Save Changes'}
                       </Button>
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

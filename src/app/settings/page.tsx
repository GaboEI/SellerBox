'use client';

import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n/i18n-provider";
import React, { useEffect, useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, doc, useStorage, setDocumentNonBlocking, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AppHeader } from "@/components/layout/header";
import { setDoc } from "firebase/firestore";

interface UserProfile {
    username?: string;
    photoUrl?: string;
}

export default function SettingsPage() {
    const { t } = useI18n();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [username, setUsername] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || 'Seller');
            if (userProfile.photoUrl) {
                setImagePreview(userProfile.photoUrl);
            }
        }
    }, [userProfile]);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!user || !firestore || !storage) return;

        setIsSaving(true);
        let photoUrl = userProfile?.photoUrl || '';

        try {
            if (imageFile) {
                const storageRef = ref(storage, `profile_pictures/${user.uid}`);
                const uploadResult = await uploadBytes(storageRef, imageFile);
                photoUrl = await getDownloadURL(uploadResult.ref);
            }
            
            const updatedProfile: UserProfile = {
                username: username,
                photoUrl: photoUrl,
            };

            const userDocRef = doc(firestore, 'users', user.uid);
            
            setDoc(userDocRef, updatedProfile, { merge: true })
                .then(() => {
                    toast({
                        title: t('success'),
                        description: t('profile_update_success'),
                    });
                })
                .catch((error) => {
                    console.error("Profile update failed:", error);
                     toast({
                        variant: "destructive",
                        title: t('error'),
                        description: t('profile_update_fail'),
                    });
                    const permissionError = new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'update',
                        requestResourceData: updatedProfile,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                })
                .finally(() => {
                    setIsSaving(false);
                });

        } catch (error) {
             console.error("Image upload failed:", error);
             toast({
                variant: "destructive",
                title: t('error'),
                description: 'Failed to upload image.',
            });
            setIsSaving(false);
        }
    };

    if (isUserLoading || isProfileLoading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 lg:p-6">
                    <div className="flex flex-col gap-8">
                        <PageHeader title={t('settings')} description={t('settings_desc')} />
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('appearance')}</CardTitle>
                                        <CardDescription>
                                            {t('appearance_desc')}
                                        </CardDescription>
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
                                        <CardDescription>
                                            {t('account_desc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={imagePreview || ''} alt={username || ''} />
                                                <AvatarFallback>{username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-picture">{t('profile_picture')}</Label>
                                                <Input id="profile-picture" type="file" accept="image/*" className="max-w-xs" onChange={handleImageUpload} disabled={isSaving} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">{t('username')}</Label>
                                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('account_management')}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline">{t('change_password')}</Button>
                                                <Button variant="outline">{t('recover_password')}</Button>
                                                <Button variant="destructive">{t('delete_account')}</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                                            {isSaving ? t('saving') : t('save_changes')}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

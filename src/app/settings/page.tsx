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
import React, { useEffect, useState, useMemo } from "react";
import { useFirestore, useDoc } from '@/firebase';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AppHeader } from "@/components/layout/header";
import { setDoc, doc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { UserProfile } from "@/lib/types";
import { useMemoFirebase } from "@/firebase/provider";


const SINGLE_USER_ID = "_single_user";

export default function SettingsPage() {
    const { t } = useI18n();
    const { firestore } = useFirestore ? useFirestore() : { firestore: null };
    const { toast } = useToast();

    const defaultProfilePic = PlaceHolderImages.find(p => p.id === 'default_user_profile')?.imageUrl || '';

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', SINGLE_USER_ID);
    }, [firestore]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [username, setUsername] = useState('');
    const [imagePreview, setImagePreview] = useState<string>(defaultProfilePic);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || 'Seller');
            setImagePreview(userProfile.photoUrl || defaultProfilePic);
        } else if (!isProfileLoading) {
            setUsername('Seller');
            setImagePreview(defaultProfilePic);
        }
    }, [userProfile, isProfileLoading, defaultProfilePic]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        if (!firestore) {
             toast({
                variant: "destructive",
                title: t('error'),
                description: "Firestore is not available.",
            });
            return;
        }

        setIsSaving(true);
        try {
            let photoUrl = userProfile?.photoUrl || defaultProfilePic;

            if (imageFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `profile_pictures/${SINGLE_USER_ID}`);
                await uploadBytes(storageRef, imageFile);
                photoUrl = await getDownloadURL(storageRef);
            }
            
            const updatedProfile: UserProfile = {
                username: username,
                photoUrl: photoUrl,
            };

            const userDocRef = doc(firestore, 'users', SINGLE_USER_ID);
            await setDoc(userDocRef, updatedProfile, { merge: true });

            toast({
                title: t('success'),
                description: t('profile_update_success'),
            });

        } catch (error) {
            console.error("Failed to save profile:", error);
            const description = error instanceof Error ? error.message : t('profile_update_fail');
            toast({
                variant: "destructive",
                title: t('error'),
                description: description,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const usernameInitial = username?.[0]?.toUpperCase() || 'U';

    if (isProfileLoading) {
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
                                                <AvatarImage src={imagePreview} alt={username} />
                                                <AvatarFallback>{usernameInitial}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-picture">{t('profile_picture')}</Label>
                                                <Input id="profile-picture" type="file" accept="image/*" className="max-w-xs" onChange={handleImageChange} disabled={isSaving} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">{t('username')}</Label>
                                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} />
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

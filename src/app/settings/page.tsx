'use client';

import React from 'react';
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

export default function SettingsPage() {
  const { t } = useI18n();

  const username = 'Seller';
  // Correctly find the placeholder image by its ID
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
                <Card>
                  <CardHeader>
                    <CardTitle>{t('account')}</CardTitle>
                    <CardDescription>{t('account_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={defaultProfilePic}
                          alt={username}
                        />
                        <AvatarFallback>{username?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                      </Avatar>
                      <div>
                         <Label>{t('profile_picture')}</Label>
                         <p className="text-sm text-muted-foreground">{t('profile_picture_fixed_desc', 'La foto de perfil es fija.')}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('username')}</Label>
                      <Input
                        id="username"
                        value={username}
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

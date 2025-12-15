'use client';

import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/i18n/i18n-provider";

export default function SettingsPage() {
    const { t } = useI18n();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title={t('settings')} description={t('settings_desc')} />
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('appearance')}</CardTitle>
                    <CardDescription>
                        {t('appearance_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme" className="text-base">{t('theme')}</Label>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

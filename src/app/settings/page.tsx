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
import React from "react";

export default function SettingsPage() {
    const { t } = useI18n();
    const [imagePreview, setImagePreview] = React.useState<string | null>("https://picsum.photos/seed/user/100/100");

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="flex flex-col gap-8">
            <PageHeader title={t('settings')} description={t('settings_desc')} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia</CardTitle>
                            <CardDescription>
                                Ajusta el aspecto de la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="theme">Tema</Label>
                                <ThemeToggle />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="language">Idioma</Label>
                                <LanguageToggle />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cuenta</CardTitle>
                            <CardDescription>
                                Gestiona la información de tu perfil y la configuración de tu cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={imagePreview || ''} alt="User Avatar" />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                     <Label htmlFor="profile-picture">Foto de perfil</Label>
                                    <Input id="profile-picture" type="file" accept="image/*" className="max-w-xs" onChange={handleImageUpload} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Nombre de usuario</Label>
                                <Input id="username" defaultValue="Seller" />
                            </div>
                            <div className="space-y-2">
                                <Label>Gestión de la cuenta</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline">Cambiar contraseña</Button>
                                    <Button variant="outline">Recuperar contraseña</Button>
                                    <Button variant="destructive">Eliminar cuenta</Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Guardar cambios</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

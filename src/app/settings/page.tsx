import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Settings" description="Customize your experience." />
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Adjust the look and feel of the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme" className="text-base">Theme</Label>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

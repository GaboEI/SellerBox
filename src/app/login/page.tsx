
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth);
  };
  
  if (isUserLoading || user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-primary rounded-md p-2 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-2xl font-bold">Welcome to SellerBox</CardTitle>
          <CardDescription>
            Sign in to continue to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleAnonymousSignIn} className="w-full">
                Sign In Anonymously
            </Button>
             <p className="text-center text-xs text-muted-foreground">
                More sign-in options will be available soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}


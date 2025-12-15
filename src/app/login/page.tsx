
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, doc } from '@/firebase';
import { initiateAnonymousSignIn, initiateEmailSignUp, initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { BarChart3, Mail, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';

function LoginForm() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    initiateEmailSignIn(auth, email, password);
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
            </div>
        </div>
        <Button onClick={handleSignIn} className="w-full">
            Sign In
        </Button>
    </div>
  )
}

function SignUpForm() {
    const auth = useAuth();
    const firestore = useFirestore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');


    const handleSignUp = () => {
        initiateEmailSignUp(auth, email, password)
            .then(userCredential => {
                if (userCredential && firestore) {
                    const userDocRef = doc(firestore, 'users', userCredential.user.uid);
                    setDoc(userDocRef, { username: username, photoUrl: '' }, { merge: true });
                }
            })
            .catch(error => {
                // The error is already emitted globally by initiateEmailSignUp
                // We could add UI-specific error handling here if needed (e.g., toast)
                console.error("Sign up failed on the client:", error);
            });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="John Doe" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                </div>
            </div>
            <Button onClick={handleSignUp} className="w-full">
                Create Account
            </Button>
        </div>
    )
}


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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <div className="bg-primary rounded-md p-2 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
            <Tabs defaultValue="sign-in" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                    <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginForm />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="sign-up">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                            <CardDescription>
                                Fill in the details to get started.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SignUpForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
             <Button onClick={handleAnonymousSignIn} variant="secondary" className="w-full mt-6">
                Sign In Anonymously
            </Button>
        </div>

    </div>
  );
}

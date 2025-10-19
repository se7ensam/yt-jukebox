'use client';

import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase/provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/host');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        toast({
          title: 'Login Successful',
          description: 'Redirecting to host dashboard...',
        });
        // The useEffect will handle the redirect
      } catch (error: any) {
        console.error('Google Sign-In error:', error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'Could not sign in with Google. Please try again.',
        });
      }
    });
  };

  if (isUserLoading || user) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Admin Login</CardTitle>
          <CardDescription>Sign in with Google to access the host panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

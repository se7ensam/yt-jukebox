'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isHostAuthenticated, logoutHost, getAuthUrl, handleOAuthCallback } from '@/lib/youtube';
import { CheckCircle, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export default function HostPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    async function checkYouTubeAuth() {
      if (user) {
        setIsCheckingAuth(true);
        const code = searchParams.get('code');
        const authed = searchParams.get('authed');

        if (code || authed) {
          await handleOAuthCallback();
          router.replace('/host'); // Use replace to avoid re-running on refresh
        }

        const authenticated = await isHostAuthenticated();
        setIsAuthenticated(authenticated);
        if (!authenticated) {
          const url = await getAuthUrl();
          setAuthUrl(url);
        }
        setIsCheckingAuth(false);
      }
    }
    checkYouTubeAuth();
  }, [user, searchParams, router]);


  const handleLogout = () => {
    startTransition(async () => {
      await logoutHost(); // Clears YouTube tokens and playlist
      if (auth) {
        await signOut(auth); // Signs out from Firebase
      }
      // The useEffect will catch the user change and redirect to /login
    });
  };

  if (isUserLoading || isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Host Control Panel</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? 'You are connected to YouTube.'
              : 'Connect your YouTube account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold">YouTube Account Connected!</p>
              <p className="text-muted-foreground">
                Guests can now add songs to your playlist.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-muted-foreground">
                To allow guests to add songs, you need to connect your YouTube account.
              </p>
              <Button asChild size="lg" disabled={!authUrl}>
                {authUrl ? (
                   <Link href={authUrl}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Connect with Google
                  </Link>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <Button onClick={handleLogout} variant="destructive" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Log Out
            </Button>
            <Button variant="link" asChild className="mt-2">
              <Link href="/">Back to Jukebox</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

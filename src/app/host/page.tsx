import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleOAuthCallback, isHostAuthenticated, logoutHost, getAuthUrl } from '@/lib/youtube';
import { revalidatePath } from 'next/cache';
import { CheckCircle, LogIn, LogOut } from 'lucide-react';

export default async function HostPage({ searchParams }: { searchParams: { authed?: string } }) {
  if (searchParams.authed === 'true') {
    await handleOAuthCallback();
    revalidatePath('/host');
    redirect('/host');
  }

  const isAuthenticated = await isHostAuthenticated();
  const authUrl = await getAuthUrl();

  async function handleLogout() {
    'use server';
    await logoutHost();
    revalidatePath('/host');
    redirect('/host');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Host Control Panel</CardTitle>
          <CardDescription>Manage your YouTube account connection.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold">You are authenticated!</p>
              <p className="text-muted-foreground">
                Guests can now add songs to your playlist.
              </p>
              <form action={handleLogout}>
                <Button variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out & Clear Playlist
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-muted-foreground">
                To allow guests to add songs, you need to connect your YouTube account. This only needs to be done once.
              </p>
              <Button asChild size="lg">
                <Link href={authUrl}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login with Google
                </Link>
              </Button>
            </div>
          )}
           <Button variant="link" asChild className="mt-4">
            <Link href="/">Back to Jukebox</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

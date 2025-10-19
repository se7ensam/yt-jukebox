import Link from 'next/link';
import { QRCode } from '@/components/QRCode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QrPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Scan to Join!</CardTitle>
          <CardDescription>
            Point your camera at this QR code to open the jukebox and add songs to the queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <QRCode />
          <Button variant="link" asChild className="mt-6">
            <Link href="/">Back to Jukebox</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

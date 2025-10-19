import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, UserCircle } from 'lucide-react';
import { TubeQueueLogo } from './TubeQueueLogo';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex w-full flex-row items-center justify-between gap-6 text-lg font-medium md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <TubeQueueLogo />
          <span className="sr-only">TubeQueue</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/qr" aria-label="QR Code">
              <QrCode className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/host" aria-label="Host Login">
              <UserCircle className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

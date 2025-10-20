import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, UserCircle } from 'lucide-react';
import { TubeQueueLogo } from './TubeQueueLogo';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-12 sm:h-14 md:h-16 items-center gap-2 sm:gap-3 md:gap-4 border-b bg-background/80 px-2 sm:px-3 md:px-4 lg:px-6 backdrop-blur-sm w-full max-w-full">
      <nav className="flex w-full max-w-full flex-row items-center justify-between gap-2 sm:gap-4 md:gap-5 lg:gap-6 text-base sm:text-lg md:text-sm font-medium">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-base font-semibold flex-shrink-0"
        >
          <TubeQueueLogo />
          <span className="sr-only">TubeQueue</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
            <Link href="/qr" aria-label="QR Code">
              <QrCode className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
            <Link href="/host" aria-label="Host Login">
              <UserCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

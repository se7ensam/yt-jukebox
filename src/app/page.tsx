import { Header } from '@/components/Header';
import { Playlist } from '@/components/Playlist';
import { SearchComponent } from '@/components/SearchComponent';
import { JukeboxStatusChecker } from '@/components/JukeboxStatusChecker';
import { getPlaylist } from '@/lib/youtube';

export default async function Home() {
  const playlist = await getPlaylist();

  return (
    <div className="flex min-h-screen w-screen max-w-full flex-col overflow-x-hidden">
      <Header />
      <main className="flex flex-1 flex-col gap-3 px-2 py-3 sm:gap-4 sm:px-3 sm:py-4 md:gap-6 md:px-6 lg:gap-8 lg:px-8 lg:py-8 max-w-full">
        <div className="mx-auto w-full max-w-full sm:max-w-6xl space-y-2 sm:space-y-3 md:space-y-6 px-1 sm:px-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold font-headline break-words">Welcome to TubeQueue</h1>
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base break-words">Scan the QR code, find your favorite song, and add it to the queue!</p>
          <JukeboxStatusChecker />
        </div>
        <div className="mx-auto grid w-full max-w-full sm:max-w-6xl gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="w-full max-w-full order-2 lg:order-1 min-w-0">
            <SearchComponent />
          </div>
          <div className="w-full max-w-full order-1 lg:order-2 min-w-0">
            <Playlist initialPlaylist={playlist} />
          </div>
        </div>
      </main>
    </div>
  );
}

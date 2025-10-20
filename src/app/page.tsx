import { Header } from '@/components/Header';
import { Playlist } from '@/components/Playlist';
import { SearchComponent } from '@/components/SearchComponent';
import { HostStatus } from '@/components/HostStatus';
import { JukeboxStatusChecker } from '@/components/JukeboxStatusChecker';
import { getPlaylist } from '@/lib/youtube';

export default async function Home() {
  const playlist = await getPlaylist();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <h1 className="text-3xl font-semibold font-headline">Welcome to TubeQueue</h1>
          <p>Scan the QR code, find your favorite song, and add it to the queue!</p>
          <HostStatus />
          <JukeboxStatusChecker />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px]">
          <div className="grid gap-6">
            <SearchComponent />
          </div>
          <div className="grid gap-6">
            <Playlist initialPlaylist={playlist} />
          </div>
        </div>
      </main>
    </div>
  );
}

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music4 } from 'lucide-react';
import type { Video } from '@/lib/definitions';

export async function Playlist({ initialPlaylist }: { initialPlaylist: Video[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Music4 className="h-6 w-6" />
          Current Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialPlaylist.length > 0 ? (
            initialPlaylist.map((song, index) => (
              <div key={`${song.id}-${index}`} className="flex items-center gap-4">
                <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                <Image
                  alt="Thumbnail"
                  className="rounded-md object-cover"
                  height="36"
                  src={song.thumbnail}
                  width="64"
                  data-ai-hint="music album"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{song.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{song.channel}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">The queue is empty. Add a song to get started!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

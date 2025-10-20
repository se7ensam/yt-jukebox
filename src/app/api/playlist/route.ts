import { NextResponse } from 'next/server';
import { getPlaylist } from '@/lib/youtube';

export async function GET() {
  try {
    console.log('Playlist API: Fetching current queue...');
    
    const playlist = await getPlaylist();
    
    console.log(`Playlist API: Returning ${playlist.length} songs`);
    
    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('Playlist API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist', playlist: [] },
      { status: 500 }
    );
  }
}


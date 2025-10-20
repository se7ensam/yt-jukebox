import { NextResponse } from 'next/server';
import { getPlaylist } from '@/lib/youtube';

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 [API /playlist] GET request received');
    console.log('⏰ Time:', timestamp);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const playlist = await getPlaylist();
    
    console.log(`✅ [API /playlist] Returning ${playlist.length} songs`);
    if (playlist.length > 0) {
      console.log('📋 [API /playlist] First song:', playlist[0].title);
      console.log('📋 [API /playlist] Last song:', playlist[playlist.length - 1].title);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('❌ [API /playlist] Error:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return NextResponse.json(
      { error: 'Failed to fetch playlist', playlist: [] },
      { status: 500 }
    );
  }
}


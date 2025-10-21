import { NextResponse } from 'next/server';
import { getJukeboxStatusServer } from '@/lib/firebase-server';

export async function GET() {
  try {
    console.log('Jukebox Status API: Fetching status...');
    
    const status = await getJukeboxStatusServer();
    
    if (!status) {
      console.log('Jukebox Status API: No status found');
      return NextResponse.json({
        isActive: false,
        selectedPlaylistId: null,
        hostUserId: null,
        lastUpdated: null,
        message: 'Jukebox not set up yet'
      });
    }
    
    console.log('Jukebox Status API: Status found');
    console.log('- Is Active:', status.isActive);
    console.log('- Playlist ID:', status.selectedPlaylistId);
    console.log('- Host User ID:', status.hostUserId);
    console.log('- Note: Tokens managed securely server-side');
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Jukebox Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jukebox status' },
      { status: 500 }
    );
  }
}

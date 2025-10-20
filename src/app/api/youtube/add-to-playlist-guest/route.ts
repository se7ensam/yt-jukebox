import { NextRequest, NextResponse } from 'next/server';
import { getJukeboxStatusServer } from '@/lib/firebase-server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoTitle } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing video ID' },
        { status: 400 }
      );
    }

    console.log('Add to Playlist Guest API: Adding video for guest');
    console.log('- Video ID:', videoId);
    console.log('- Video Title:', videoTitle);

    // Get jukebox status (public document, includes access token)
    const jukeboxStatus = await getJukeboxStatusServer();
    
    if (!jukeboxStatus || !jukeboxStatus.isActive) {
      return NextResponse.json(
        { error: 'Jukebox is not active. Please ask the host to set up the jukebox.' },
        { status: 403 }
      );
    }
    
    if (!jukeboxStatus.selectedPlaylistId) {
      return NextResponse.json(
        { error: 'No playlist selected. Please ask the host to select a playlist in the admin panel.' },
        { status: 403 }
      );
    }
    
    if (!jukeboxStatus.accessToken) {
      return NextResponse.json(
        { error: 'Host is not connected to YouTube. Please ask the host to log in.' },
        { status: 403 }
      );
    }
    
    const { selectedPlaylistId: playlistId, accessToken, tokenExpiry } = jukeboxStatus;
    
    console.log('- Playlist ID:', playlistId);
    console.log('- Access Token found:', !!accessToken);
    
    // Check if token is expired
    if (tokenExpiry && tokenExpiry < Date.now()) {
      console.log('- Access Token expired');
      return NextResponse.json(
        { error: 'Host authentication expired. Please ask the host to reconnect to YouTube.' },
        { status: 403 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Host is not connected to YouTube. Please ask the host to log in and select a playlist.' },
        { status: 403 }
      );
    }

    // Add to YouTube playlist using host's access token
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId,
            },
          },
        }),
      }
    );

    console.log('- YouTube API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('- YouTube API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to add to YouTube playlist',
          details: error.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('- Successfully added to YouTube playlist');

    return NextResponse.json({
      success: true,
      message: `Successfully added "${videoTitle}" to YouTube playlist`,
      playlistItemId: result.id
    });

  } catch (error) {
    console.error('Add to Playlist Guest API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during playlist addition' },
      { status: 500 }
    );
  }
}

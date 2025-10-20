import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoTitle, playlistId, accessToken } = await request.json();

    if (!videoId || !playlistId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Add to Playlist API: Adding video to YouTube playlist');
    console.log('- Video ID:', videoId);
    console.log('- Playlist ID:', playlistId);
    console.log('- Access Token:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NOT_SET');

    // Add to real YouTube playlist
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

    console.log('Add to Playlist API: YouTube API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Add to Playlist API: YouTube API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to add to YouTube playlist',
          details: error.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Add to Playlist API: Successfully added to YouTube playlist');

    return NextResponse.json({
      success: true,
      message: `Successfully added "${videoTitle}" to YouTube playlist`,
      playlistItemId: result.id
    });

  } catch (error) {
    console.error('Add to Playlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during playlist addition' },
      { status: 500 }
    );
  }
}

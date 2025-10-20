import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = searchParams.get('maxResults') || '8';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ videos: [] });
  }

  try {
    // Use YouTube Data API with API key (public access)
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    console.log('Search API: Environment check:');
    console.log('- YOUTUBE_API_KEY exists:', !!YOUTUBE_API_KEY);
    console.log('- YOUTUBE_API_KEY length:', YOUTUBE_API_KEY?.length || 0);
    console.log('- All env vars with YOUTUBE:', Object.keys(process.env).filter(key => key.includes('YOUTUBE')));
    
    if (!YOUTUBE_API_KEY) {
      console.log('Search API: No YouTube API key found, using fallback');
      return NextResponse.json({ 
        videos: [],
        query,
        source: 'error',
        error: 'YouTube API key not configured'
      });
    }

    console.log('Search API: Using real YouTube API with API key');
    
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
    console.log('Search API: YouTube API URL:', apiUrl);
    console.log('Search API: Query parameters:');
    console.log('- part: snippet');
    console.log('- type: video');
    console.log('- q:', query);
    console.log('- maxResults:', maxResults);
    console.log('- videoCategoryId: 10 (Music)');
    console.log('- key:', YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.substring(0, 10)}...` : 'NOT_SET');
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Search API: YouTube API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Search API: YouTube API response data:', data);
      
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: 'Unknown' // YouTube search API doesn't include duration
      })) || [];

      console.log('Search API: Returning real YouTube videos:', videos.length);
      return NextResponse.json({ 
        videos,
        query,
        source: 'youtube'
      });
    } else {
      const errorData = await response.json();
      console.log('Search API: YouTube API error:', errorData);
      return NextResponse.json({ 
        videos: [],
        query,
        source: 'error',
        error: errorData.error?.message || 'YouTube API error'
      });
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        videos: [],
        query,
        source: 'error',
        error: 'Failed to search videos'
      },
      { status: 500 }
    );
  }
}

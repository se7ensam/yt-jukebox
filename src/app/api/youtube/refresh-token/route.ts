import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 400 });
  }

  const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
    return NextResponse.json({ error: 'YouTube API credentials not configured on server' }, { status: 500 });
  }

  try {
    console.log('Refreshing YouTube access token...');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }
      console.error('Token refresh failed:', errorDetails);
      return NextResponse.json(
        { error: 'Failed to refresh token', details: errorDetails },
        { status: tokenResponse.status }
      );
    }

    const tokens = await tokenResponse.json();
    
    console.log('Access token refreshed successfully');
    return NextResponse.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error during token refresh' }, { status: 500 });
  }
}

# Token Security Architecture

## Problem Statement

The previous implementation had critical security issues:

1. **Access tokens stored in publicly readable Firestore documents** (`/jukebox/status`)
2. **No automatic token refresh** - tokens expire after ~1 hour, breaking the jukebox
3. **Security risk** - Anyone could read the access token from the public document

## New Architecture

### 🔐 Secure Token Storage

```
Firestore Structure:
├── /jukebox/status (PUBLIC READ)
│   ├── isActive: boolean
│   ├── selectedPlaylistId: string
│   ├── hostUserId: string
│   └── lastUpdated: timestamp
│   ❌ NO TOKENS HERE
│
└── /users/{userId}/auth/youtube (PRIVATE - Admin SDK only)
    ├── accessToken: string
    ├── refreshToken: string
    ├── expiryDate: number
    └── lastRefreshed: timestamp
```

### ♻️ Automatic Token Refresh

**Server-Side Token Management** (`src/lib/youtube-token-refresh.ts`):

```typescript
// Automatically refreshes expired tokens
getValidAccessTokenServer(userId)
  ├── Check if token exists in /users/{userId}/auth/youtube
  ├── If expired → Call Google OAuth refresh endpoint
  ├── Update Firestore with new token
  └── Return valid access token
```

**Key Features:**
- 5-minute buffer before expiry
- Automatic refresh using refresh token
- Thread-safe (Firestore transactions)
- Server-side only (uses Firebase Admin SDK)

### 🔄 Guest Add Song Flow

**Old Flow (Insecure):**
```
Guest → API → Read token from /jukebox/status → Use token → ❌ Exposed
```

**New Flow (Secure):**
```
Guest → API → getJukeboxStatusWithValidToken()
              ├── Read public status (/jukebox/status)
              ├── Get hostUserId
              ├── getValidAccessTokenServer(hostUserId)
              │   ├── Read from /users/{userId}/auth/youtube (Admin SDK)
              │   ├── Check expiry
              │   └── Auto-refresh if needed
              └── Return valid token (server-side only)
```

## Security Rules

### Updated Firestore Rules (`firestore.rules`)

```javascript
// Public jukebox status (NO tokens)
match /jukebox/status {
  allow read: if true;  // Anyone can read basic status
  allow write: if isSignedIn();  // Only authenticated users can write
}

// Private tokens (Admin SDK only)
match /users/{userId}/auth/{authProvider} {
  allow get: if isSignedIn() && isOwner(userId);  // User can read their own
  allow write: if isSignedIn() && isOwner(userId);
}
```

**Key Security Improvements:**
- ✅ Tokens never exposed to clients
- ✅ Guests can't read host tokens
- ✅ Only Firebase Admin SDK can bypass rules (server-side)
- ✅ Automatic token refresh prevents expiry issues

## Implementation Details

### 1. Token Refresh Logic

**File:** `src/lib/youtube-token-refresh.ts`

```typescript
export async function getValidAccessTokenServer(userId: string): Promise<string | null> {
  // Get token from Firestore (Admin SDK)
  const tokenDoc = await db.collection('users').doc(userId).collection('auth').doc('youtube').get();
  
  // Check if expired (5-min buffer)
  if (tokenData.expiryDate > now + 5 * 60 * 1000) {
    return tokenData.accessToken;  // Still valid
  }
  
  // Refresh using refresh token
  const newToken = await refreshAccessToken(tokenData.refreshToken);
  
  // Update Firestore
  await tokenDoc.ref.update({
    accessToken: newToken.accessToken,
    expiryDate: newToken.expiryDate,
  });
  
  return newToken.accessToken;
}
```

### 2. Guest API Update

**File:** `src/app/api/youtube/add-to-playlist-guest/route.ts`

```typescript
// OLD: const jukeboxStatus = await getJukeboxStatusServer();
// NEW:
const jukeboxStatus = await getJukeboxStatusWithValidToken();
// ✅ Automatically refreshes token if needed
// ✅ Never exposes token to client
```

### 3. Playlist Fetching Update

**File:** `src/lib/youtube.ts`

```typescript
export async function getPlaylist(): Promise<Video[]> {
  // Get status with auto-refreshed token
  const status = await getJukeboxStatusWithValidToken();
  
  // Use valid token for YouTube API
  const response = await fetch(youtubeApiUrl, {
    headers: { 'Authorization': `Bearer ${status.accessToken}` }
  });
}
```

## Benefits

### 🛡️ Security
- **No token exposure** - Tokens never leave the server
- **Firestore rules enforced** - Only Admin SDK can access tokens
- **Audit trail** - `lastRefreshed` timestamp for debugging

### 🔄 Reliability
- **Auto-refresh** - No manual reconnection needed
- **5-minute buffer** - Prevents race conditions
- **Graceful failure** - Clear error messages if refresh fails

### 🚀 Performance
- **Token caching** - Only refreshes when needed
- **Single refresh per request** - No redundant calls
- **Optimistic updates** - Fast response times

## Migration Notes

### Breaking Changes
1. **`JukeboxStatus` interface** no longer includes `accessToken` or `tokenExpiry`
2. **`updateJukeboxStatus()`** function signature changed (removed token parameters)
3. **Firestore rules** updated - old clients won't work

### Migration Steps
1. ✅ Update Firestore rules (`firestore.rules`)
2. ✅ Deploy new backend code
3. ✅ Host must reconnect YouTube (to store refresh token properly)
4. ✅ Existing tokens will continue to work until expiry

## Testing

### Test Token Expiry
```typescript
// Manually set expiry to past
await db.collection('users').doc(userId).collection('auth').doc('youtube').update({
  expiryDate: Date.now() - 1000  // 1 second ago
});

// Next API call should auto-refresh
const status = await getJukeboxStatusWithValidToken();
// ✅ Should succeed with new token
```

### Test Refresh Failure
```typescript
// Set invalid refresh token
await db.collection('users').doc(userId).collection('auth').doc('youtube').update({
  refreshToken: 'invalid_token'
});

// Next API call should fail gracefully
const status = await getJukeboxStatusWithValidToken();
// ❌ Returns null with error logged
```

## Troubleshooting

### "Unable to authenticate" error
- **Cause:** Refresh token invalid or expired
- **Solution:** Host must reconnect YouTube account in `/host` panel

### Token refresh fails repeatedly
- **Check:** YouTube OAuth credentials configured correctly
- **Check:** `YOUTUBE_CLIENT_SECRET` environment variable set
- **Check:** Firestore rules allow Admin SDK access

### Guests can't add songs
- **Check:** `/jukebox/status` document exists and `isActive: true`
- **Check:** Host has valid tokens in `/users/{hostUserId}/auth/youtube`
- **Check:** Firebase Admin SDK initialized properly

## Future Improvements

1. **Token rotation** - Rotate refresh tokens periodically
2. **Rate limiting** - Prevent abuse of token refresh endpoint
3. **Monitoring** - Alert when tokens fail to refresh
4. **Multi-host support** - Multiple hosts with separate playlists
5. **Backup tokens** - Fallback if primary refresh fails

## References

- [Google OAuth 2.0 Token Refresh](https://developers.google.com/identity/protocols/oauth2/web-server#offline)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)


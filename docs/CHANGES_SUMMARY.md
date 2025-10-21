# Token Security Refactor - Summary of Changes

## 🎯 What Was Changed

This refactor addresses the security concern about storing expiring access tokens in publicly readable Firestore documents.

## 📝 Files Modified

### 1. **Firestore Security Rules** (`firestore.rules`)
**Changed:**
- `/jukebox` path split into `/jukebox/status` (public) and `/jukebox/private` (admin-only)
- Removed token exposure from public documents

**Before:**
```javascript
match /jukebox/{document=**} {
  allow read: if true;  // ❌ Exposed tokens to everyone
}
```

**After:**
```javascript
match /jukebox/status {
  allow read: if true;  // ✅ Only basic status, no tokens
}

match /jukebox/private {
  allow read, write: if false;  // ✅ Admin SDK only
}
```

---

### 2. **New File: Token Refresh Utility** (`src/lib/youtube-token-refresh.ts`)
**Added:**
- `getValidAccessTokenServer()` - Automatically refreshes expired tokens
- `refreshAccessToken()` - Calls Google OAuth to get new token
- `getJukeboxStatusWithValidToken()` - Returns status with valid token

**Key Feature:**
```typescript
// Automatically checks expiry and refreshes if needed
if (tokenData.expiryDate > now + 5 * 60 * 1000) {
  return tokenData.accessToken;  // Still valid
}

// Auto-refresh if expired
const newToken = await refreshAccessToken(refreshToken);
```

---

### 3. **Jukebox Status Database** (`src/lib/jukebox-status-db.ts`)
**Changed:**
- Removed `accessToken` and `tokenExpiry` from `JukeboxStatus` interface
- Updated `updateJukeboxStatus()` to not accept token parameters

**Before:**
```typescript
export interface JukeboxStatus {
  accessToken: string | null;  // ❌ Stored publicly
  tokenExpiry: number | null;
}
```

**After:**
```typescript
export interface JukeboxStatus {
  // Removed: accessToken and tokenExpiry
  // ✅ Now handled server-side only
}
```

---

### 4. **Guest Add Song API** (`src/app/api/youtube/add-to-playlist-guest/route.ts`)
**Changed:**
- Now uses `getJukeboxStatusWithValidToken()` for automatic token refresh
- Removed manual token expiry checking

**Before:**
```typescript
const jukeboxStatus = await getJukeboxStatusServer();
if (tokenExpiry && tokenExpiry < Date.now()) {
  return error;  // ❌ Manual check, no auto-refresh
}
```

**After:**
```typescript
const jukeboxStatus = await getJukeboxStatusWithValidToken();
// ✅ Token automatically refreshed if expired
```

---

### 5. **YouTube Library** (`src/lib/youtube.ts`)
**Changed:**
- `setSelectedPlaylist()` no longer stores tokens in public document
- `getPlaylist()` uses token refresh for fetching playlist

**Before:**
```typescript
await updateJukeboxStatus(firestore, {
  accessToken: tokens.accessToken,  // ❌ Stored publicly
  tokenExpiry: tokens.expiryDate,
});
```

**After:**
```typescript
await updateJukeboxStatus(firestore, {
  // ✅ No tokens in public document
  isActive: true,
  selectedPlaylistId: playlistId,
  hostUserId: user.uid,
});
// Tokens stored separately: /users/{userId}/auth/youtube
```

---

### 6. **Firebase Admin Helper** (`src/lib/firebase-admin.ts`)
**Changed:**
- Added `getFirestoreAdmin()` helper function for token refresh utility

---

### 7. **Jukebox Status API** (`src/app/api/jukebox/status/route.ts`)
**Changed:**
- Removed token-related logging
- Updated response structure to match new interface

---

## 🔒 Security Improvements

| Issue | Before | After |
|-------|--------|-------|
| **Token Exposure** | ❌ Publicly readable in `/jukebox/status` | ✅ Private, Admin SDK only |
| **Token Expiry** | ❌ Manual reconnection required | ✅ Automatic refresh |
| **Firestore Rules** | ❌ Weak (public token access) | ✅ Strong (tokens server-side only) |
| **Token Lifetime** | ❌ 1 hour, then breaks | ✅ Infinite via refresh token |

---

## 📊 Architecture Comparison

### Before (Insecure)
```
┌─────────┐
│  Guest  │
└────┬────┘
     │ 1. Add song
     ▼
┌─────────────────┐
│  API Route      │
└────┬────────────┘
     │ 2. Read /jukebox/status
     ▼
┌─────────────────┐
│  Firestore      │  ❌ accessToken: "ya29.a0..." (PUBLIC)
│  /jukebox/      │  ❌ Anyone can read this!
│  status         │
└─────────────────┘
```

### After (Secure)
```
┌─────────┐
│  Guest  │
└────┬────┘
     │ 1. Add song
     ▼
┌──────────────────────────────┐
│  API Route                   │
│  getJukeboxStatusWithValidToken()
└────┬─────────────────────────┘
     │ 2. Read /jukebox/status (public - NO token)
     │ 3. Get hostUserId
     ▼
┌──────────────────────────────┐
│  Token Refresh               │
│  getValidAccessTokenServer() │
└────┬─────────────────────────┘
     │ 4. Read /users/{id}/auth/youtube (Admin SDK)
     │ 5. Check expiry
     │ 6. Auto-refresh if needed
     ▼
┌─────────────────┐
│  Firestore      │  ✅ accessToken stored privately
│  /users/{id}/   │  ✅ Only Admin SDK can access
│  auth/youtube   │  ✅ Auto-refreshed when needed
└─────────────────┘
```

---

## ✅ Testing Checklist

After deploying these changes:

1. **Host must reconnect YouTube** (to store refresh token properly)
   - Navigate to `/host`
   - Click "Connect with Google"
   - Select a playlist

2. **Test guest song addition**
   - Open main page as guest
   - Search for a song
   - Click "Add" button
   - ✅ Should succeed without errors

3. **Test token refresh** (wait 1 hour or manually expire token)
   - Guest adds another song
   - ✅ Should auto-refresh and succeed

4. **Check Firestore**
   - `/jukebox/status` should NOT contain `accessToken`
   - `/users/{hostUserId}/auth/youtube` should contain tokens
   - ✅ Verify structure matches documentation

---

## 🚨 Breaking Changes

### For Existing Deployments

1. **Host must reconnect** - Existing tokens may not work without refresh token
2. **Firestore rules** - Must deploy updated rules (`firestore deploy --only firestore:rules`)
3. **API clients** - Any code reading `/jukebox/status.accessToken` will break

### Migration Steps

```bash
# 1. Deploy new code
npm run build
npm run deploy

# 2. Update Firestore rules
firebase deploy --only firestore:rules

# 3. Have host reconnect YouTube
# Navigate to /host and click "Connect with Google"

# 4. Test guest functionality
# Try adding a song as a guest
```

---

## 📚 Documentation

- **Full details:** See `docs/TOKEN_SECURITY.md`
- **Architecture diagram:** See ASCII diagrams above
- **Security rules:** See `firestore.rules`

---

## 🎉 Result

✅ **No more token expiration issues**
✅ **Enhanced security** - tokens never exposed
✅ **Better UX** - seamless operation without manual intervention
✅ **Production-ready** - follows OAuth best practices


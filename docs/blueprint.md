# **App Name**: TubeQueue

## Core Features:

- Host Authentication: Authenticate the host's YouTube account via Google OAuth and store OAuth tokens in Firestore.
- OAuth Callback Handling: Handle the YouTube OAuth token exchange process via Firebase Cloud Functions.
- Song Search: Enable users to search for songs using the YouTube Data API.
- Playlist Addition: Allow users to add selected songs to a YouTube playlist linked to the host’s account.
- QR Code Access: Provide a static QR code that directs users to the public-facing song request page.
- Real-time Playlist Display (Optional): Use Firestore listeners to display the real-time playlist updates on the user interface.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to reflect YouTube's brand while providing a fresh feel.
- Background color: A light gray (#F0F0F0) to ensure readability and a clean interface.
- Accent color: An energetic orange (#FF9933), analogous to the primary color, to highlight interactive elements.
- Body and headline font: 'PT Sans', a humanist sans-serif for a balance of modernity and warmth, ensuring readability for all text elements.
- Use clear, recognizable icons for actions like 'Add to Playlist', 'Search', and 'Play'. Favor the Google Material Design icon set for consistency.
- Maintain a simple, intuitive layout with a prominent search bar, clear song listings, and easy-to-find playlist display (if the optional feature is implemented).
- Incorporate subtle animations for user interactions, such as adding a song to the playlist, to provide visual feedback.
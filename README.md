# YouTube Jukebox

A collaborative YouTube jukebox application built with Next.js and Firebase.

## Features

- 📱 **QR Code Sharing** - Easy sharing via QR codes
- 🎯 **Playlist Management** - Select which YouTube playlist to use
- 🔄 **Real-time Updates** - Live playlist updates across all devices
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yt-jukebox
   ```

2. **Install dependency**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

## Environment Setup

See [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) for detailed environment configuration instructions.

## Available Scripts

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **TypeScript:** Full type safety

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── firebase/           # Firebase configuration and hooks
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and data
└── ai/                 # AI/Genkit integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

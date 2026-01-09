# AstaStream - Ultimate Anime Streaming Platform

An extremely animated and beautiful anime streaming website built with Next.js, featuring multiple streaming providers and a stunning UI.

## Features

- **Multiple Streaming Providers**: Integrated with HiAnime, GoGoAnime, Aniwatch, and Universal fallback for reliable streaming
- **Ad Blocker**: Built-in ad blocking and redirect prevention for smooth viewing experience
- **Beautiful Animations**: Every component is animated using Framer Motion
- **Live Backgrounds**: Dynamic gradient backgrounds with interactive effects
- **Trending Anime**: Real-time trending anime from AniList API
- **Search Functionality**: Fast and responsive anime search
- **Episode Selection**: Easy episode navigation and streaming
- **Responsive Design**: Works perfectly on all devices
- **Glass Morphism UI**: Modern glassmorphic design elements

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Source**: AniList GraphQL API
- **Streaming**: HiAnime.to via aniwatch npm package (v2.24.3)
- **Additional Sources**: GoGoAnime, Aniwatch.to, and multiple mirror sites

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
npm start
```

## Features Overview

### Homepage
- Trending anime grid with animations
- Interactive search bar
- Beautiful hero section
- Smooth animations and transitions

### Anime Detail Page
- Full anime information from AniList
- Episode selector with grid view
- 4 streaming server options:
  - **HiAnime (Best)**: Primary server with direct video sources via aniwatch API
  - **GoGoAnime**: Alternative server with multiple mirrors (anitaku.pe, gogoanime3.co)
  - **Aniwatch**: Backup server (aniwatch.to, kaido.to, zoro.to)
  - **Universal**: Smart player that tries all sources with automatic fallback
- Video player with built-in ad blocking and subtitle support

### Search & Browse
- Fast search functionality
- Browse all anime
- Infinite scroll support
- Animated results

### Ad Blocking & Security
- Blocks popup windows automatically
- Prevents redirects and malicious scripts
- Removes ad elements periodically
- Sandboxed iframes for additional security
- Clean and safe streaming experience

## API Documentation

### Streaming Endpoints

#### `/api/stream/episode-sources`
Fetches direct video sources from HiAnime using the aniwatch package.

**Query Parameters:**
- `animeId`: HiAnime anime ID
- `episode`: Episode number

**Response:**
```json
{
  "success": true,
  "episodeId": "steinsgate-3?ep=230",
  "episodeNumber": 1,
  "server": "vidstreaming",
  "sources": [
    {
      "url": "https://...",
      "quality": "1080p"
    }
  ],
  "subtitles": [
    {
      "url": "https://...",
      "lang": "English"
    }
  ]
}
```

#### `/api/stream/search-anime`
Maps AniList anime to HiAnime for streaming.

**Query Parameters:**
- `q`: Anime title to search
- `anilistId`: Optional AniList ID

**Response:**
```json
{
  "success": true,
  "anime": {
    "id": "steinsgate-3",
    "name": "Steins;Gate",
    "episodes": 24
  }
}
```

#### Server-specific Players

- `/api/stream/hianime` - HiAnime player with direct sources
- `/api/stream/gogoanime` - GoGoAnime iframe player
- `/api/stream/aniwatch` - Aniwatch iframe player
- `/api/stream/universal` - Universal player with auto-fallback

All accept: `anime`, `episode`, `id` query parameters

## Created By

**@Hellfirez3643**

Telegram: [@Hellfirez3643](https://t.me/Hellfirez3643)

## License

This project is open source and available for personal use.

## Deployment

Deploy on Vercel for the best experience:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

Made with passion for anime fans worldwide

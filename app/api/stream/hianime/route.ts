import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  // HiAnime.to direct streaming with better URL construction
  const sanitizedTitle = anime.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - HiAnime</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #player-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    video {
      width: 100%;
      height: 100%;
      background: #000;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #22d3ee;
      font-size: 16px;
      text-align: center;
      z-index: 100;
    }
    .spinner {
      border: 3px solid rgba(34, 211, 238, 0.2);
      border-radius: 50%;
      border-top: 3px solid #22d3ee;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #fb7185;
      padding: 20px;
      text-align: center;
    }
    [class*="ad"], [id*="ad"], ins { display: none !important; }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Loading from HiAnime...</div>
    </div>
    <video id="player" controls autoplay></video>
  </div>

  <script>
    (function() {
      'use strict';

      const anilistId = '${animeId}';
      const episodeNum = '${episode}';
      const animeTitle = '${anime}';

      async function loadStream() {
        const loading = document.getElementById('loading');
        const player = document.getElementById('player');

        try {
          // First, search for the anime on HiAnime
          const searchResponse = await fetch(\`/api/stream/search-anime?q=\${encodeURIComponent(animeTitle)}&anilistId=\${anilistId}\`);

          if (!searchResponse.ok) {
            throw new Error('Failed to find anime');
          }

          const searchData = await searchResponse.json();
          const hiAnimeId = searchData.anime.id;

          // Get episode sources
          const sourcesResponse = await fetch(\`/api/stream/episode-sources?animeId=\${hiAnimeId}&episode=\${episodeNum}\`);

          if (!sourcesResponse.ok) {
            throw new Error('Failed to get episode sources');
          }

          const sourcesData = await sourcesResponse.json();

          if (sourcesData.sources && sourcesData.sources.length > 0) {
            // Use the highest quality source
            const source = sourcesData.sources.find(s => s.quality === '1080p' || s.quality === 'default') || sourcesData.sources[0];

            player.src = source.url;

            // Add subtitles if available
            if (sourcesData.subtitles && sourcesData.subtitles.length > 0) {
              sourcesData.subtitles.forEach((sub, index) => {
                const track = document.createElement('track');
                track.kind = 'subtitles';
                track.label = sub.lang || \`Subtitle \${index + 1}\`;
                track.srclang = sub.lang || 'en';
                track.src = sub.url;
                if (index === 0) track.default = true;
                player.appendChild(track);
              });
            }

            setTimeout(() => {
              if (loading) loading.style.display = 'none';
            }, 1000);
          } else {
            throw new Error('No video sources available');
          }
        } catch (error) {
          console.error('Error loading stream:', error);
          if (loading) {
            loading.innerHTML = '<div class="error">Unable to load stream. Please try another server.</div>';
          }
        }
      }

      loadStream();

      // Remove ads periodically
      setInterval(() => {
        document.querySelectorAll('[class*="ad"],[id*="ad"],ins').forEach(e => e.remove());
      }, 300);

    })();
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
}

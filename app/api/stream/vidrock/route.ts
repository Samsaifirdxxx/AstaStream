import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  // VidRock streaming implementation with ad blocking
  const embedUrl = `https://vidrock.net/embed/${animeId}-episode-${episode}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode}</title>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    #player-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #a78bfa;
      font-size: 16px;
      text-align: center;
    }
    .spinner {
      border: 3px solid rgba(167, 139, 250, 0.2);
      border-radius: 50%;
      border-top: 3px solid #a78bfa;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading">
      <div class="spinner"></div>
      <div>Loading Episode ${episode}...</div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>
  </div>

  <script>
    (function() {
      'use strict';

      // Remove loading overlay after delay
      setTimeout(() => {
        const loading = document.querySelector('.loading');
        if (loading) loading.style.display = 'none';
      }, 2000);

      // Alternative streaming sources
      const sources = [
        'https://vidrock.net/embed/${animeId}-episode-${episode}',
        'https://gogoanime.lu/streaming.php?id=${animeId}-episode-${episode}',
        'https://www.mp4upload.com/embed-${animeId}${episode}.html'
      ];

      let currentSource = 0;

      function loadPlayer() {
        const iframe = document.getElementById('player');
        iframe.src = sources[currentSource];

        iframe.onerror = function() {
          currentSource++;
          if (currentSource < sources.length) {
            console.log('Trying alternative source...');
            setTimeout(loadPlayer, 1000);
          }
        };
      }

      loadPlayer();

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

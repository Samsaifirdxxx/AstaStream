import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  const sanitizedTitle = anime.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - Aniwatch</title>
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
      color: #fb7185;
      font-size: 16px;
      text-align: center;
      z-index: 100;
    }
    .spinner {
      border: 3px solid rgba(251, 113, 133, 0.2);
      border-radius: 50%;
      border-top: 3px solid #fb7185;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    [class*="ad"], [id*="ad"], ins { display: none !important; }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Loading from Aniwatch...</div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-modals"></iframe>
  </div>

  <script>
    (function() {
      'use strict';

      window.open = () => null;

      const streamSources = [
        'https://aniwatch.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}',
        'https://aniwatch.to/embed/${sanitizedTitle}-${animeId}?ep=${episode}',
        'https://hianime.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}',
        'https://kaido.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}',
      ];

      let sourceIndex = 0;

      function loadStream() {
        const iframe = document.getElementById('player');
        const loading = document.getElementById('loading');

        iframe.src = streamSources[sourceIndex];

        iframe.onload = function() {
          setTimeout(() => {
            if (loading) loading.style.display = 'none';
          }, 2000);
        };

        iframe.onerror = function() {
          sourceIndex++;
          if (sourceIndex < streamSources.length) {
            console.log('Trying backup source', sourceIndex);
            setTimeout(loadStream, 1000);
          } else {
            if (loading) {
              loading.innerHTML = '<div style="color: #fb7185;">Unable to load stream. Please try another server.</div>';
            }
          }
        };
      }

      loadStream();

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

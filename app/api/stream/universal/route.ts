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
  <title>Episode ${episode} - Universal Player</title>
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
      color: #34d399;
      font-size: 16px;
      text-align: center;
      z-index: 100;
    }
    .spinner {
      border: 3px solid rgba(52, 211, 153, 0.2);
      border-radius: 50%;
      border-top: 3px solid #34d399;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .source-info {
      margin-top: 10px;
      font-size: 12px;
      color: #888;
    }
    [class*="ad"], [id*="ad"], ins { display: none !important; }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Finding best streaming source...</div>
      <div class="source-info" id="source-info"></div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-modals"></iframe>
  </div>

  <script>
    (function() {
      'use strict';

      window.open = () => null;

      // Multiple streaming sources with priority order
      const streamSources = [
        { url: 'https://hianime.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}', name: 'HiAnime Primary' },
        { url: 'https://aniwatch.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}', name: 'Aniwatch' },
        { url: 'https://anitaku.pe/streaming.php?id=${sanitizedTitle}-episode-${episode}', name: 'GoGoAnime' },
        { url: 'https://hianime.to/embed/${sanitizedTitle}-${animeId}?ep=${episode}', name: 'HiAnime Embed' },
        { url: 'https://embtaku.pro/streaming.php?id=${sanitizedTitle}-episode-${episode}', name: 'GoGoAnime Mirror' },
        { url: 'https://kaido.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}', name: 'Kaido' },
        { url: 'https://zoro.to/watch/${sanitizedTitle}-${animeId}?ep=${episode}', name: 'Zoro' },
      ];

      let sourceIndex = 0;
      let retryCount = 0;
      const maxRetries = 2;

      function updateSourceInfo(text) {
        const sourceInfo = document.getElementById('source-info');
        if (sourceInfo) {
          sourceInfo.textContent = text;
        }
      }

      function loadStream() {
        const iframe = document.getElementById('player');
        const loading = document.getElementById('loading');

        if (sourceIndex >= streamSources.length) {
          if (retryCount < maxRetries) {
            retryCount++;
            sourceIndex = 0;
            updateSourceInfo(\`Retrying... (Attempt \${retryCount + 1})\`);
            setTimeout(loadStream, 2000);
            return;
          } else {
            if (loading) {
              loading.innerHTML = '<div style="color: #fb7185;">Unable to load stream from any source. Please try another server or check back later.</div>';
            }
            return;
          }
        }

        const currentSource = streamSources[sourceIndex];
        updateSourceInfo(\`Trying: \${currentSource.name}\`);

        iframe.src = currentSource.url;

        let loadTimeout = setTimeout(() => {
          console.log('Load timeout for', currentSource.name);
          sourceIndex++;
          loadStream();
        }, 10000);

        iframe.onload = function() {
          clearTimeout(loadTimeout);
          setTimeout(() => {
            if (loading) {
              loading.style.display = 'none';
              console.log('Successfully loaded:', currentSource.name);
            }
          }, 2000);
        };

        iframe.onerror = function() {
          clearTimeout(loadTimeout);
          console.log('Failed to load from', currentSource.name);
          sourceIndex++;
          setTimeout(loadStream, 1000);
        };
      }

      loadStream();

      // Remove ads periodically
      setInterval(() => {
        document.querySelectorAll('[class*="ad"],[id*="ad"],ins').forEach(e => e.remove());
      }, 300);

      // Prevent ad clicks
      document.addEventListener('click', e => {
        if (e.target.closest('[class*="ad"]')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);

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

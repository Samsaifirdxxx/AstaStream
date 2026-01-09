import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - Zoro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html {
      width: 100%; height: 100%; overflow: hidden;
      background: #000; font-family: system-ui, sans-serif;
    }
    #player-container { width: 100%; height: 100%; position: relative; }
    iframe { width: 100%; height: 100%; border: none; }
    [class*="ad"], [id*="ad"], ins { display: none !important; }
    .loading {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); color: #a78bfa;
      text-align: center; z-index: 100;
    }
    .spinner {
      border: 3px solid rgba(167, 139, 250, 0.2);
      border-radius: 50%; border-top: 3px solid #a78bfa;
      width: 40px; height: 40px;
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
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Loading from Zoro...</div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
  </div>

  <script>
    (function() {
      'use strict';
      window.open = () => null;

      const sources = [
        'https://aniwatch.to/watch/${animeId}?ep=${episode}',
        'https://zoro.to/watch/${animeId}?ep=${episode}',
        'https://hianime.to/watch/${animeId}?ep=${episode}'
      ];

      let idx = 0;
      function load() {
        const iframe = document.getElementById('player');
        iframe.src = sources[idx];
        iframe.onload = () => setTimeout(() => {
          const l = document.getElementById('loading');
          if (l) l.style.display = 'none';
        }, 1500);
        iframe.onerror = () => {
          if (++idx < sources.length) setTimeout(load, 1000);
        };
      }
      load();

      setInterval(() => {
        document.querySelectorAll('[class*="ad"],[id*="ad"],ins').forEach(e => e.remove());
      }, 300);

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
    },
  });
}

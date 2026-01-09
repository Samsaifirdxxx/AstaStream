import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  const sanitized = anime.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - AnimePahe</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html {
      width: 100%; height: 100%; overflow: hidden;
      background: #000; font-family: system-ui;
    }
    #player-container { width: 100%; height: 100%; }
    iframe { width: 100%; height: 100%; border: none; }
    [class*="ad"], [id*="ad"] { display: none !important; }
    .loading {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); color: #fb7185;
      text-align: center; z-index: 100;
    }
    .spinner {
      border: 3px solid rgba(251, 113, 133, 0.2);
      border-radius: 50%; border-top: 3px solid #fb7185;
      width: 40px; height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Loading from AnimePahe...</div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-modals"></iframe>
  </div>

  <script>
    (function() {
      window.open = () => null;

      const sources = [
        'https://animepahe.ru/play/${animeId}/${episode}',
        'https://pahe.win/play/${animeId}/${episode}',
        'https://kwik.si/e/${animeId}${episode}',
        'https://animepahe.com/play/${animeId}/${episode}'
      ];

      let i = 0;
      function go() {
        const p = document.getElementById('player');
        p.src = sources[i];
        p.onload = () => setTimeout(() => {
          const l = document.getElementById('loading');
          if (l) l.style.display = 'none';
        }, 1500);
        p.onerror = () => { if (++i < sources.length) setTimeout(go, 1000); };
      }
      go();

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
    },
  });
}

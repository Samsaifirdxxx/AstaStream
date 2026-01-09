import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  // GogoAnime streaming with ad blocking
  const sanitizedTitle = anime.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - GogoAnime</title>
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
    .ad-overlay, .redirect-blocker, [class*="ad-"], [id*="ad-"] {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
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
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Loading from GogoAnime...</div>
    </div>
    <iframe id="player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
  </div>

  <script>
    (function() {
      'use strict';

      // Block all popups and ads
      window.open = () => null;
      window.alert = () => null;
      window.confirm = () => true;
      window.print = () => null;

      // Prevent redirects
      const originalLocation = window.location.href;
      let redirectAttempts = 0;

      const locationProxy = new Proxy(window.location, {
        set: function(target, prop, value) {
          if (prop === 'href' && value !== originalLocation) {
            redirectAttempts++;
            console.log('Blocked redirect attempt', redirectAttempts, 'to:', value);
            return false;
          }
          return Reflect.set(target, prop, value);
        }
      });

      // Ad removal
      function removeAds() {
        const selectors = [
          '[class*="ad"]', '[id*="ad"]', '[class*="banner"]',
          '[id*="banner"]', '[class*="popup"]', 'ins', '.adsbygoogle',
          '[data-ad]', '[class*="sponsor"]', 'iframe[src*="ad"]'
        ];

        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => {
              if (!el.id.includes('player') && el.id !== 'player-container') {
                el.remove();
              }
            });
          } catch(e) {}
        });
      }

      // Block click hijacking
      document.addEventListener('click', function(e) {
        const target = e.target;
        const isAd = target && (
          target.classList.toString().includes('ad') ||
          target.id.includes('ad') ||
          target.closest('[class*="ad"]') ||
          target.hasAttribute('data-ad')
        );

        if (isAd) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      }, true);

      // Multiple streaming sources
      const streamSources = [
        'https://gogoanime.lu/streaming.php?id=${sanitizedTitle}-episode-${episode}',
        'https://gogoplay.io/streaming.php?id=${sanitizedTitle}-episode-${episode}',
        'https://embtaku.pro/streaming.php?id=${sanitizedTitle}-episode-${episode}',
        'https://www.mp4upload.com/embed-${animeId}${episode}.html'
      ];

      let sourceIndex = 0;

      function loadStream() {
        const iframe = document.getElementById('player');
        const loading = document.getElementById('loading');

        iframe.src = streamSources[sourceIndex];

        iframe.onload = function() {
          setTimeout(() => {
            if (loading) loading.style.display = 'none';
          }, 1500);
        };

        iframe.onerror = function() {
          sourceIndex++;
          if (sourceIndex < streamSources.length) {
            console.log('Trying backup source', sourceIndex);
            setTimeout(loadStream, 1000);
          } else {
            if (loading) {
              loading.innerHTML = '<div style="color: #fb7185;">Unable to load stream. Please try another provider.</div>';
            }
          }
        };
      }

      loadStream();

      // Continuous ad blocking
      setInterval(removeAds, 300);

      // Mutation observer for dynamic ads
      new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.id !== 'player-container') {
              const el = node;
              if (el.classList.toString().includes('ad') ||
                  el.id.includes('ad') ||
                  el.tagName === 'INS') {
                el.remove();
              }
            }
          });
        });
      }).observe(document.body, { childList: true, subtree: true });

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

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get("anime") || "";
  const episode = searchParams.get("episode") || "1";
  const animeId = searchParams.get("id") || "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Episode ${episode} - Universal Player</title>
  <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
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
      display: flex;
      flex-direction: column;
    }
    #player {
      flex: 1;
      width: 100%;
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
    .error {
      color: #fb7185;
      padding: 20px;
      text-align: center;
    }
    .plyr {
      width: 100%;
      height: 100%;
    }
    .plyr__video-wrapper {
      background: #000;
    }
    .source-selector {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.8);
      flex-wrap: wrap;
      justify-content: center;
      z-index: 10;
    }
    .source-btn {
      padding: 8px 16px;
      background: rgba(52, 211, 153, 0.2);
      border: 1px solid #34d399;
      color: #34d399;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s;
    }
    .source-btn:hover {
      background: rgba(52, 211, 153, 0.4);
    }
    .source-btn.active {
      background: #34d399;
      color: #000;
    }
    [class*="ad"], [id*="ad"], ins, .ad-container, .advertisement {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  </style>
</head>
<body>
  <div id="player-container">
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div>Finding best streaming source...</div>
      <div class="source-info" id="source-info"></div>
    </div>
    <div class="source-selector" id="source-selector" style="display: none;"></div>
    <video id="player" controls playsinline></video>
  </div>

  <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <script>
    (function() {
      'use strict';

      // Block all popups and ads
      window.open = function() { return null; };
      window.alert = function() { return null; };

      const anilistId = '${animeId}';
      const episodeNum = '${episode}';
      const animeTitle = '${anime}';

      let currentPlayer = null;
      let currentHls = null;

      const providers = [
        { name: 'GogoAnime', endpoint: 'gogoanime-sources' },
        { name: 'Zoro', endpoint: 'aniwatch-sources' },
        { name: 'HiAnime', endpoint: 'hianime-sources' }
      ];

      let currentProviderIndex = 0;

      function updateSourceInfo(text) {
        const sourceInfo = document.getElementById('source-info');
        if (sourceInfo) {
          sourceInfo.textContent = text;
        }
      }

      function cleanupPlayer() {
        if (currentHls) {
          currentHls.destroy();
          currentHls = null;
        }
        if (currentPlayer) {
          currentPlayer.destroy();
          currentPlayer = null;
        }
      }

      async function loadFromProvider(providerIndex) {
        const loading = document.getElementById('loading');
        const videoElement = document.getElementById('player');
        const sourceSelector = document.getElementById('source-selector');

        cleanupPlayer();

        const provider = providers[providerIndex];
        updateSourceInfo(\`Loading from \${provider.name}...\`);

        try {
          const response = await fetch(\`/api/stream/\${provider.endpoint}?anime=\${encodeURIComponent(animeTitle)}&episode=\${episodeNum}&id=\${anilistId}\`);

          if (!response.ok) {
            throw new Error(\`Failed to load from \${provider.name}\`);
          }

          const data = await response.json();

          if (!data.success || !data.sources || data.sources.length === 0) {
            throw new Error(\`No sources from \${provider.name}\`);
          }

          // Get the best quality source
          const source = data.sources.find(s => s.quality === '1080p' || s.quality === 'default') || data.sources[0];
          const videoUrl = source.url;

          // Check if HLS stream
          if (videoUrl.includes('.m3u8') || source.isM3U8) {
            if (Hls.isSupported()) {
              currentHls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                xhrSetup: function(xhr, url) {
                  xhr.withCredentials = false;
                }
              });

              currentHls.loadSource(videoUrl);
              currentHls.attachMedia(videoElement);

              currentHls.on(Hls.Events.MANIFEST_PARSED, function() {
                currentPlayer = new Plyr(videoElement, {
                  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
                  settings: ['quality', 'speed'],
                  quality: {
                    default: 1080,
                    options: [1080, 720, 480, 360]
                  }
                });

                // Add subtitles if available
                if (data.subtitles && data.subtitles.length > 0) {
                  data.subtitles.forEach((sub, index) => {
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = sub.lang || \`Subtitle \${index + 1}\`;
                    track.srclang = sub.lang || 'en';
                    track.src = sub.url;
                    if (index === 0) track.default = true;
                    videoElement.appendChild(track);
                  });
                }

                currentPlayer.play().catch(e => console.log('Autoplay prevented:', e));

                setTimeout(() => {
                  if (loading) loading.style.display = 'none';
                  updateSourceInfo(\`Playing from \${provider.name}\`);

                  // Show source selector
                  sourceSelector.innerHTML = '';
                  providers.forEach((p, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'source-btn' + (idx === providerIndex ? ' active' : '');
                    btn.textContent = p.name;
                    btn.onclick = () => loadFromProvider(idx);
                    sourceSelector.appendChild(btn);
                  });
                  sourceSelector.style.display = 'flex';
                }, 500);
              });

              currentHls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                  console.error('HLS Error:', data);
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.log('Network error, trying to recover...');
                      currentHls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log('Media error, trying to recover...');
                      currentHls.recoverMediaError();
                      break;
                    default:
                      throw new Error('Failed to load video stream');
                  }
                }
              });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
              videoElement.src = videoUrl;

              currentPlayer = new Plyr(videoElement, {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen']
              });

              videoElement.addEventListener('loadedmetadata', function() {
                currentPlayer.play().catch(e => console.log('Autoplay prevented:', e));
                setTimeout(() => {
                  if (loading) loading.style.display = 'none';
                  updateSourceInfo(\`Playing from \${provider.name}\`);
                  sourceSelector.style.display = 'flex';
                }, 500);
              });
            }
          } else {
            videoElement.src = videoUrl;

            currentPlayer = new Plyr(videoElement, {
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
            });

            videoElement.addEventListener('loadedmetadata', function() {
              currentPlayer.play().catch(e => console.log('Autoplay prevented:', e));
              setTimeout(() => {
                if (loading) loading.style.display = 'none';
                updateSourceInfo(\`Playing from \${provider.name}\`);
                sourceSelector.style.display = 'flex';
              }, 500);
            });
          }

          currentProviderIndex = providerIndex;

        } catch (error) {
          console.error(\`Error loading from \${provider.name}:\`, error);

          // Try next provider
          const nextIndex = providerIndex + 1;
          if (nextIndex < providers.length) {
            console.log(\`Trying next provider: \${providers[nextIndex].name}\`);
            setTimeout(() => loadFromProvider(nextIndex), 1000);
          } else {
            if (loading) {
              loading.innerHTML = '<div class="error">Unable to load stream from any source. Please try another server.</div>';
            }
          }
        }
      }

      // Start loading when page is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadFromProvider(0));
      } else {
        loadFromProvider(0);
      }

      // Aggressive ad removal
      setInterval(() => {
        document.querySelectorAll('[class*="ad"],[id*="ad"],ins,.ad-container,.advertisement').forEach(e => {
          e.remove();
        });
      }, 100);

      // Block ad scripts
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
              const src = node.src || node.innerHTML;
              if (src && (src.includes('ad') || src.includes('doubleclick') || src.includes('adsystem'))) {
                node.remove();
              }
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

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

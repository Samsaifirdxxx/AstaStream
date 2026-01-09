import { NextResponse } from "next/server";
import { ANIME } from "@consumet/extensions";

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
  <title>Episode ${episode} - HiAnime</title>
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
    }
    #player {
      width: 100%;
      height: 100%;
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
    .plyr {
      width: 100%;
      height: 100%;
    }
    .plyr__video-wrapper {
      background: #000;
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
    <video id="player" controls playsinline></video>
  </div>

  <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <script>
    (function() {
      'use strict';

      const anilistId = '${animeId}';
      const episodeNum = '${episode}';
      const animeTitle = '${anime}';

      async function loadStream() {
        const loading = document.getElementById('loading');
        const videoElement = document.getElementById('player');

        try {
          // Fetch streaming sources from our backend API
          const response = await fetch(\`/api/stream/hianime-sources?anime=\${encodeURIComponent(animeTitle)}&episode=\${episodeNum}&id=\${anilistId}\`);

          if (!response.ok) {
            throw new Error('Failed to get streaming sources');
          }

          const data = await response.json();

          if (!data.success || !data.sources || data.sources.length === 0) {
            throw new Error('No video sources available');
          }

          // Get the best quality source
          const source = data.sources.find(s => s.quality === '1080p' || s.quality === 'default') || data.sources[0];
          const videoUrl = source.url;

          // Check if HLS stream
          if (videoUrl.includes('.m3u8') || source.isM3U8) {
            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
              });

              hls.loadSource(videoUrl);
              hls.attachMedia(videoElement);

              hls.on(Hls.Events.MANIFEST_PARSED, function() {
                // Initialize Plyr
                const player = new Plyr(videoElement, {
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

                player.play();

                setTimeout(() => {
                  if (loading) loading.style.display = 'none';
                }, 500);
              });

              hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                  console.error('HLS Error:', data);
                  throw new Error('Failed to load video stream');
                }
              });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
              // Native HLS support (Safari)
              videoElement.src = videoUrl;

              const player = new Plyr(videoElement, {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen']
              });

              videoElement.addEventListener('loadedmetadata', function() {
                player.play();
                setTimeout(() => {
                  if (loading) loading.style.display = 'none';
                }, 500);
              });
            }
          } else {
            // Direct MP4 video
            videoElement.src = videoUrl;

            const player = new Plyr(videoElement, {
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
            });

            videoElement.addEventListener('loadedmetadata', function() {
              player.play();
              setTimeout(() => {
                if (loading) loading.style.display = 'none';
              }, 500);
            });
          }
        } catch (error) {
          console.error('Error loading stream:', error);
          if (loading) {
            loading.innerHTML = '<div class="error">Unable to load stream. Please try another server.</div>';
          }
        }
      }

      // Start loading when page is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadStream);
      } else {
        loadStream();
      }

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

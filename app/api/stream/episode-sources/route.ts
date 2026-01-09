import { NextResponse } from "next/server";
import { HiAnime } from "aniwatch";

const scraper = new HiAnime.Scraper();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const animeId = searchParams.get("animeId");
    const episodeNumber = searchParams.get("episode");

    if (!animeId || !episodeNumber) {
      return NextResponse.json(
        { error: "Missing animeId or episode parameter" },
        { status: 400 }
      );
    }

    // Get episodes for the anime
    const episodesData = await scraper.getEpisodes(animeId);

    if (!episodesData?.episodes || episodesData.episodes.length === 0) {
      return NextResponse.json(
        { error: "No episodes found for this anime" },
        { status: 404 }
      );
    }

    // Find the specific episode
    const episode = episodesData.episodes.find(
      (ep: any) => ep.number === parseInt(episodeNumber)
    );

    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeNumber} not found` },
        { status: 404 }
      );
    }

    // Get episode sources - using the episode ID
    const episodeId = episode.episodeId;

    if (!episodeId) {
      return NextResponse.json(
        { error: "Episode ID not found" },
        { status: 404 }
      );
    }

    // Try different servers
    const servers: HiAnime.AnimeServers[] = [
      HiAnime.Servers.VidStreaming as HiAnime.AnimeServers,
      HiAnime.Servers.MegaCloud as HiAnime.AnimeServers,
      HiAnime.Servers.StreamTape as HiAnime.AnimeServers,
      HiAnime.Servers.VidCloud as HiAnime.AnimeServers,
    ];

    let sources = null;
    let usedServer: HiAnime.AnimeServers | null = null;

    for (const server of servers) {
      try {
        const sourcesData = await scraper.getEpisodeSources(episodeId, server);
        if (sourcesData?.sources && sourcesData.sources.length > 0) {
          sources = sourcesData;
          usedServer = server;
          break;
        }
      } catch (err) {
        console.error(`Failed to get sources from ${server}:`, err);
        continue;
      }
    }

    if (!sources || !sources.sources || sources.sources.length === 0) {
      return NextResponse.json(
        { error: "No streaming sources available for this episode" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      episodeId,
      episodeNumber: parseInt(episodeNumber),
      server: usedServer,
      sources: sources.sources,
      subtitles: sources.subtitles || [],
      intro: sources.intro || null,
    });

  } catch (error: any) {
    console.error("Error fetching episode sources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch episode sources" },
      { status: 500 }
    );
  }
}

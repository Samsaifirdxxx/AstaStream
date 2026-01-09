import { NextResponse } from "next/server";
import { ANIME } from "@consumet/extensions";

// Initialize the Gogoanime provider (it has good sources)
const gogoanime = new ANIME.Gogoanime();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const animeTitle = searchParams.get("anime") || "";
    const episode = searchParams.get("episode") || "1";

    if (!animeTitle) {
      return NextResponse.json(
        { success: false, error: "Missing anime title" },
        { status: 400 }
      );
    }

    // Search for the anime
    const searchResults = await gogoanime.search(animeTitle);

    if (!searchResults || searchResults.results.length === 0) {
      return NextResponse.json(
        { success: false, error: "Anime not found" },
        { status: 404 }
      );
    }

    // Get the first result
    const anime = searchResults.results[0];

    // Get episode info
    const animeInfo = await gogoanime.fetchAnimeInfo(anime.id);

    if (!animeInfo || !animeInfo.episodes || animeInfo.episodes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No episodes found" },
        { status: 404 }
      );
    }

    // Find the episode
    const episodeNum = parseInt(episode);
    const episodeData = animeInfo.episodes.find(
      (ep: any) => ep.number === episodeNum
    );

    if (!episodeData) {
      return NextResponse.json(
        { success: false, error: `Episode ${episode} not found` },
        { status: 404 }
      );
    }

    // Get streaming sources
    const sources = await gogoanime.fetchEpisodeSources(episodeData.id);

    if (!sources || !sources.sources || sources.sources.length === 0) {
      return NextResponse.json(
        { success: false, error: "No streaming sources available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sources: sources.sources,
      subtitles: sources.subtitles || [],
      download: sources.download || null,
    });
  } catch (error: any) {
    console.error("Error fetching HiAnime sources:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

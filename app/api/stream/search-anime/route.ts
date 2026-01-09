import { NextResponse } from "next/server";
import { HiAnime } from "aniwatch";

const scraper = new HiAnime.Scraper();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const anilistId = searchParams.get("anilistId");

    if (!query && !anilistId) {
      return NextResponse.json(
        { error: "Missing query or anilistId parameter" },
        { status: 400 }
      );
    }

    // Search for the anime
    const searchResults = await scraper.search(query || "", 1);

    if (!searchResults?.animes || searchResults.animes.length === 0) {
      return NextResponse.json(
        { error: "No anime found matching the query" },
        { status: 404 }
      );
    }

    // Return the first result (most relevant)
    const anime = searchResults.animes[0];

    if (!anime.id) {
      return NextResponse.json(
        { error: "Anime ID not found" },
        { status: 404 }
      );
    }

    // Get detailed info for the anime
    const animeInfo = await scraper.getInfo(anime.id);

    return NextResponse.json({
      success: true,
      anime: {
        id: anime.id,
        name: anime.name,
        poster: anime.poster,
        type: anime.type,
        rating: anime.rating,
        episodes: animeInfo?.anime?.info?.stats?.episodes || null,
        duration: animeInfo?.anime?.info?.stats?.duration || null,
      },
      fullInfo: animeInfo,
    });

  } catch (error: any) {
    console.error("Error searching anime:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search anime" },
      { status: 500 }
    );
  }
}

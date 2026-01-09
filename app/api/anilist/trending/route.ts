import { NextResponse } from "next/server";
import { anilistGraphql, type AniListMedia } from "@/app/lib/anilist";

const Query = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
      id
      title { romaji english native }
      description
      episodes
      duration
      season
      seasonYear
      format
      status
      averageScore
      popularity
      genres
      bannerImage
      coverImage { large extraLarge color }
    }
  }
}
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const perPage = Math.min(Number(searchParams.get("perPage") ?? "20") || 20, 50);
  try {
    const data = await anilistGraphql<{
      Page: {
        pageInfo: {
          total: number;
          currentPage: number;
          lastPage: number;
          hasNextPage: boolean;
        };
        media: AniListMedia[];
      };
    }>(Query, { page, perPage });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}


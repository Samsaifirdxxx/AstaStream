import { NextResponse } from "next/server";
import { anilistGraphql, type AniListMedia } from "@/app/lib/anilist";

const Query = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
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
`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await anilistGraphql<{ Media: AniListMedia | null }>(Query, {
      id: numericId,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}


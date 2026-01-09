export type AniListTitle = {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
};

export type AniListCoverImage = {
  large?: string | null;
  extraLarge?: string | null;
  color?: string | null;
};

export type AniListMedia = {
  id: number;
  title?: AniListTitle | null;
  description?: string | null;
  episodes?: number | null;
  duration?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  format?: string | null;
  status?: string | null;
  averageScore?: number | null;
  popularity?: number | null;
  genres?: (string | null)[] | null;
  bannerImage?: string | null;
  coverImage?: AniListCoverImage | null;
};

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export async function anilistGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AniList error: ${response.status} ${text}`);
  }

  const json = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new Error("AniList error: missing data");
  return json.data;
}

export function cleanHtmlDescription(description?: string | null) {
  if (!description) return "";
  return description
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function preferTitle(title?: AniListTitle | null) {
  return (
    title?.english ||
    title?.romaji ||
    title?.native ||
    "Untitled"
  );
}


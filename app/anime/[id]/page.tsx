"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Star,
  ChevronLeft,
  Film,
  Sparkles,
  PlayCircle,
  Server,
} from "lucide-react";
import { Background } from "../../components/Background";
import Link from "next/link";
import Image from "next/image";

type AnimeDetails = {
  id: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: {
    large?: string;
    extraLarge?: string;
    color?: string;
  };
  bannerImage?: string;
  averageScore?: number;
  episodes?: number;
  duration?: number;
  season?: string;
  seasonYear?: number;
  status?: string;
  genres?: string[];
  format?: string;
};

const StreamProvider = {
  HIANIME: "hianime",
  GOGOANIME: "gogoanime",
  ANIWATCH: "aniwatch",
  UNIVERSAL: "universal",
} as const;

type StreamProviderType = (typeof StreamProvider)[keyof typeof StreamProvider];

const providerNames: Record<StreamProviderType, string> = {
  [StreamProvider.HIANIME]: "HiAnime (Best)",
  [StreamProvider.GOGOANIME]: "GoGoAnime",
  [StreamProvider.ANIWATCH]: "Aniwatch",
  [StreamProvider.UNIVERSAL]: "Universal (All Sources)",
};

const providers = Object.values(StreamProvider) as StreamProviderType[];

export default function AnimePage() {
  const params = useParams();
  const animeId = params?.id as string;

  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<StreamProviderType>(
    StreamProvider.HIANIME
  );
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!animeId) return;

    setLoading(true);
    fetch(`/api/anilist/media/${animeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.Media) setAnime(data.Media);
        else setAnime(null);
        setLoading(false);
      })
      .catch(() => {
        setAnime(null);
        setLoading(false);
      });
  }, [animeId]);

  const getTitle = (a: AnimeDetails) =>
    a.title?.english || a.title?.romaji || a.title?.native || "Untitled";

  const cleanDescription = (desc?: string) => {
    if (!desc) return "";
    return desc
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const getStreamUrl = (provider: StreamProviderType, episode: number) => {
    const title = anime?.title?.english || anime?.title?.romaji || "";
    const encodedTitle = encodeURIComponent(title);

    switch (provider) {
      case StreamProvider.HIANIME:
        return `/api/stream/hianime?anime=${encodedTitle}&episode=${episode}&id=${animeId}`;
      case StreamProvider.GOGOANIME:
        return `/api/stream/gogoanime?anime=${encodedTitle}&episode=${episode}&id=${animeId}`;
      case StreamProvider.ANIWATCH:
        return `/api/stream/aniwatch?anime=${encodedTitle}&episode=${episode}&id=${animeId}`;
      case StreamProvider.UNIVERSAL:
        return `/api/stream/universal?anime=${encodedTitle}&episode=${episode}&id=${animeId}`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Background />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Background />
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Anime not found</h1>
          <Link href="/" className="btn">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              AstaStream
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </motion.header>

      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Banner */}
          {anime.bannerImage && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative -mx-4 h-[200px] sm:h-[300px] md:h-[400px] mb-8 overflow-hidden"
            >
              <Image
                src={anime.bannerImage}
                alt={getTitle(anime)}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] xl:grid-cols-[320px,1fr] gap-6 md:gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass rounded-2xl overflow-hidden mb-6"
              >
                <div className="aspect-[2/3] relative">
                  {anime.coverImage?.extraLarge ? (
                    <Image
                      src={anime.coverImage.extraLarge}
                      alt={getTitle(anime)}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 60vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-2/20" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 space-y-4"
              >
                {anime.averageScore && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{anime.averageScore / 10}</span>
                    <span className="text-muted text-sm">/ 10</span>
                  </div>
                )}

                {anime.status && (
                  <div>
                    <div className="text-sm text-muted mb-1">Status</div>
                    <div className="font-semibold">{anime.status}</div>
                  </div>
                )}

                {anime.episodes && (
                  <div>
                    <div className="text-sm text-muted mb-1">Episodes</div>
                    <div className="font-semibold">{anime.episodes}</div>
                  </div>
                )}

                {anime.duration && (
                  <div>
                    <div className="text-sm text-muted mb-1">Duration</div>
                    <div className="font-semibold">{anime.duration} min/ep</div>
                  </div>
                )}

                {anime.season && anime.seasonYear && (
                  <div>
                    <div className="text-sm text-muted mb-1">Season</div>
                    <div className="font-semibold">
                      {anime.season} {anime.seasonYear}
                    </div>
                  </div>
                )}

                {anime.format && (
                  <div>
                    <div className="text-sm text-muted mb-1">Format</div>
                    <div className="font-semibold">{anime.format}</div>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Main Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent leading-tight">
                  {getTitle(anime)}
                </h1>

                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {anime.genres.map((genre) => (
                      <span key={genre} className="tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {anime.description && (
                  <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Film className="w-5 h-5 text-accent" />
                      Synopsis
                    </h2>
                    <p className="text-muted leading-relaxed whitespace-pre-line">
                      {cleanDescription(anime.description)}
                    </p>
                  </div>
                )}

                {/* Stream Provider Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass rounded-2xl p-6 mb-6"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-accent" />
                    Select Stream Provider
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {providers.map((provider) => (
                      <motion.button
                        key={provider}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedProvider(provider)}
                        className={`btn text-sm md:text-base ${
                          selectedProvider === provider ? "ring-2 ring-accent shadow-lg" : "opacity-60 hover:opacity-80"
                        }`}
                      >
                        {providerNames[provider]}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Episode Selection */}
                {anime.episodes && anime.episodes > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-6 mb-6"
                  >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-accent" />
                      Episodes
                    </h2>

                    <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 md:gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {[...Array(anime.episodes)].map((_, i) => {
                        const ep = i + 1;
                        return (
                          <motion.button
                            key={ep}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedEpisode(ep);
                              setShowPlayer(true);
                            }}
                            className={`aspect-square rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                              selectedEpisode === ep
                                ? "btn ring-2 ring-accent shadow-lg"
                                : "glass hover:bg-accent/10"
                            }`}
                          >
                            {ep}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Video Player */}
                <AnimatePresence>
                  {showPlayer && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      transition={{ type: "spring", bounce: 0.2 }}
                      className="glass rounded-2xl overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-accent/20 to-accent-2/20 p-4 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                          <Play className="w-5 h-5 text-accent" />
                          Episode {selectedEpisode} - {providerNames[selectedProvider]}
                        </h3>
                      </div>

                      <div className="relative w-full aspect-video bg-black">
                        <iframe
                          src={getStreamUrl(selectedProvider, selectedEpisode)}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-modals"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 glass mt-20 py-8"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-4">
            <a
              href="https://t.me/Hellfirez3643"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent hover:text-accent-2 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Created by @Hellfirez3643</span>
            </a>
          </motion.div>
          <p className="text-muted text-sm">AstaStream - Your Ultimate Anime Streaming Platform</p>
        </div>
      </motion.footer>
    </div>
  );
}

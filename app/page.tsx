"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search, Play, Star, TrendingUp, Film, Sparkles } from "lucide-react";
import { Background } from "./components/Background";
import Link from "next/link";
import Image from "next/image";

type AnimeMedia = {
  id: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    large?: string;
    extraLarge?: string;
    color?: string;
  };
  averageScore?: number;
  episodes?: number;
  genres?: string[];
  format?: string;
};

// ✅ Use `satisfies Variants` to avoid TS widening / transition.type mismatch
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} satisfies Variants;

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      // ✅ literal type ensures it matches Framer Motion Transition typing
      type: "spring" as const,
      bounce: 0.3,
      duration: 0.7,
    },
  },
} satisfies Variants;

export default function Home() {
  const [trending, setTrending] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetch("/api/anilist/trending?perPage=20")
      .then((r) => r.json())
      .then((data) => {
        if (data.Page?.media) setTrending(data.Page.media);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getTitle = (anime: AnimeMedia) =>
    anime.title?.english || anime.title?.romaji || anime.title?.native || "Untitled";

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

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </Link>
            <Link
              href="/browse"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
            >
              <Film className="w-4 h-4" />
              Browse
            </Link>
          </nav>
        </div>
      </motion.header>

      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 bg-gradient-to-r from-accent via-accent-2 to-danger bg-clip-text text-transparent leading-tight"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Watch Anime
              <br />
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">Without Limits</span>
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted mb-10 max-w-2xl mx-auto px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Stream thousands of anime episodes in HD quality with multiple providers. Your ultimate destination for unlimited anime entertainment.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto relative"
            >
              <motion.div
                animate={{
                  scale: searchFocused ? 1.02 : 1,
                  boxShadow: searchFocused
                    ? "0 0 40px rgba(167, 139, 250, 0.3)"
                    : "0 0 0px rgba(167, 139, 250, 0)",
                }}
                className="glass rounded-full flex items-center px-4 sm:px-6 py-3 sm:py-4 transition-all"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted mr-2 sm:mr-3" />
                <input
                  type="text"
                  placeholder="Search for anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted text-sm sm:text-base"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 sm:ml-3 btn text-sm sm:text-base"
                >
                  Search
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>

          {/* Trending Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              Trending Now
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl aspect-[2/3] animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
              >
                {trending.map((anime) => (
                  <motion.div key={anime.id} variants={item}>
                    <Link href={`/anime/${anime.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative rounded-2xl overflow-hidden glass cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
                      >
                        <div className="aspect-[2/3] relative">
                          {anime.coverImage?.extraLarge ? (
                            <Image
                              src={anime.coverImage.extraLarge}
                              alt={getTitle(anime)}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-2/20" />
                          )}

                          {/* Hover Overlay */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-4"
                          >
                            <div className="w-full">
                              <div className="flex items-center gap-2 mb-2">
                                {anime.averageScore && (
                                  <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-semibold">
                                      {anime.averageScore / 10}
                                    </span>
                                  </div>
                                )}
                                {anime.episodes && (
                                  <span className="text-xs text-muted">{anime.episodes} eps</span>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full btn flex items-center justify-center gap-2 text-sm"
                              >
                                <Play className="w-4 h-4" />
                                Watch Now
                              </motion.button>
                            </div>
                          </motion.div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 text-sm leading-tight">
                            {getTitle(anime)}
                          </h3>
                          {anime.genres && anime.genres.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {anime.genres.slice(0, 2).map((genre) => (
                                <span key={genre} className="tag text-xs">
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
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

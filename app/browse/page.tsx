"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Play, Sparkles, ChevronLeft, Film, TrendingUp } from "lucide-react";
import { Background } from "../components/Background";
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.3, duration: 0.6 },
  },
};

export default function BrowsePage() {
  const [anime, setAnime] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadMore();
  }, []);

  const loadMore = () => {
    setLoading(true);
    fetch(`/api/anilist/trending?page=${page}&perPage=30`)
      .then((r) => r.json())
      .then((data) => {
        if (data.Page?.media) {
          setAnime((prev) => [...prev, ...data.Page.media]);
          setPage((p) => p + 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-accent-2 to-danger bg-clip-text text-transparent flex items-center gap-3">
              <Film className="w-10 h-10 text-accent" />
              Browse Anime
            </h1>
            <p className="text-xl text-muted">
              Discover thousands of anime series and movies
            </p>
          </motion.div>

          {anime.length === 0 && loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="skeleton rounded-2xl aspect-[2/3] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              >
                {anime.map((anime) => (
                  <motion.div key={anime.id} variants={item}>
                    <Link href={`/anime/${anime.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative rounded-2xl overflow-hidden glass cursor-pointer"
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
                                  <span className="text-xs text-muted">
                                    {anime.episodes} eps
                                  </span>
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

              {/* Load More Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={loading}
                  className="btn text-lg px-8 py-4"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Load More
                    </>
                  )}
                </motion.button>
              </motion.div>
            </>
          )}
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
          <p className="text-muted text-sm">
            AstaStream - Your Ultimate Anime Streaming Platform
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Star, Play, Sparkles, ChevronLeft, Film, TrendingUp } from "lucide-react";
import { Background } from "../components/Background";
import Link from "next/link";
import Image from "next/image";

interface Anime {
  id: string;
  title: string;
  image: string;
  rating: number;
  episodes: number;
  year: number;
}

export default function BrowsePage() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.jikan.moe/v4/top/anime")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.data.map((a: any) => ({
          id: String(a.mal_id),
          title: a.title,
          image: a.images.webp.image_url,
          rating: a.score ?? 0,
          episodes: a.episodes ?? 0,
          year: a.year ?? 0,
        }));
        setAnime(mapped);
        setLoading(false);
      });
  }, []);

  /* -------------------- Animations -------------------- */

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.6,
      },
    },
  };

  /* -------------------- UI -------------------- */

  return (
    <main className="min-h-screen relative">
      <Background />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-10"
        >
          <ChevronLeft size={20} />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <Film className="text-purple-400" size={28} />
          <h1 className="text-4xl font-bold">Browse Anime</h1>
        </div>

        {loading && (
          <div className="text-center text-purple-300 animate-pulse">
            Loading anime…
          </div>
        )}

        {!loading && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {anime.map((anime) => (
              <motion.div key={anime.id} variants={item}>
                <Link href={`/anime/${anime.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -8 }}
                    className="bg-black/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-purple-500/20 transition"
                  >
                    <div className="relative w-full h-[280px]">
                      <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {anime.title}
                      </h3>

                      <div className="flex items-center justify-between text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400" />
                          {anime.rating}
                        </div>

                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} />
                          {anime.episodes} eps
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition flex items-end justify-center pb-6">
                      <div className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-full">
                        <Play size={16} />
                        Watch
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

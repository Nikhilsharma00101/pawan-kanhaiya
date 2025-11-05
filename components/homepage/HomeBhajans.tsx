"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { Playfair_Display, Noto_Serif_Devanagari } from "next/font/google";

const heading = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const body = Noto_Serif_Devanagari({ subsets: ["devanagari"], weight: ["400"] });

interface Bhajan {
  _id: string;
  title: string;
  category: string;
  lyrics: string;
  description?: string;
}

interface BhajanGroups {
  [category: string]: Bhajan[];
}

export default function PremiumHomeBhajans() {
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchBhajans = async () => {
      try {
        const res = await fetch("/api/bhajans");
        const data: Bhajan[] = await res.json();
        setBhajans(data);
      } catch (err) {
        console.error("Failed to load bhajans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBhajans();
  }, []);

  // Group bhajans by category
  const grouped: BhajanGroups = bhajans.reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {} as BhajanGroups);

  const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  const pageFade = {
    initial: { opacity: 0, scale: 0.995 },
    animate: { opacity: 1, scale: 1 },
  };

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageFade}
      transition={{ duration: 0.9 }}
      className={`${body.className} min-h-screen bg-gradient-to-b from-[#fff4da] via-[#ffe2aa] to-[#ffd275] text-gray-900 flex flex-col items-center pb-28 relative overflow-x-hidden`}
    >
      {/* Decorative floating particles (tiny diyas) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-6 top-24 opacity-40 animate-drift-slow">🪔</div>
        <div className="absolute right-12 top-48 opacity-30 animate-drift">✨</div>
        <div className="absolute left-20 bottom-40 opacity-25 animate-drift-wide">✨</div>
      </div>

      {/* Audio (chanting) */}
      <audio ref={audioRef} loop src="/audio/soft-chant.mp3" preload="none" />

      {/* =================== NAVBAR =================== */}
      <header className="fixed top-4 left-0 w-full px-6 md:px-12 z-50">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-full overflow-hidden shadow-sm">
              <Image src="/images/logo.png" alt="logo" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <h1 className={`${heading.className} text-2xl md:text-3xl text-amber-800 font-bold tracking-wide`}>🪔 श्री भजन संग्रह</h1>
              <p className="text-xs text-amber-600/90">आध्यात्मिक भक्ति — शांति और श्रवण</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-amber-700 font-medium">
            <a href="#categories" className="hover:text-amber-900 transition">भजन श्रेणियाँ</a>
            <a href="#about" className="hover:text-amber-900 transition">हमारे बारे में</a>
            <button
              onClick={toggleAudio}
              className="px-4 py-2 rounded-full bg-amber-100/60 hover:bg-amber-100/90 transition shadow-inner"
              aria-pressed={playing}
            >
              {playing ? "🔇 संगीत बंद करें" : "🎶 शांत संगीत"}
            </button>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white rounded-full shadow-lg hover:scale-105 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-semibold">Dashboard</span>
            </a>
          </nav>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleAudio} className="p-2 rounded-full bg-white/60 shadow-sm">{playing ? "🔇" : "🎶"}</button>
          </div>
        </div>
      </header>

      {/* =================== MAIN CONTENT =================== */}
      <main className="pt-36 w-full px-6 sm:px-10 md:px-16 lg:px-24 mt-5">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent"
            />
            <p className="text-amber-700 mt-6 font-semibold">🔱 भजन लोड हो रहे हैं...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ======= CATEGORY VIEW ======= */}
          {!selectedCategory && !selectedBhajan && !loading && (
            <motion.section
              key="categories"
              variants={fade}
              initial="initial"
              animate="animate"
              exit="exit"
              id="categories"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
            >
              {Object.keys(grouped).length === 0 && (
                <div className="col-span-full text-center text-amber-600 p-10">कोई भजन उपलब्ध नहीं है</div>
              )}

              {Object.keys(grouped).map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(category)}
                  className="relative overflow-hidden rounded-3xl shadow-xl border border-amber-300 bg-gradient-to-br from-yellow-50 to-amber-100 text-center py-12 px-6 group hover:shadow-amber-200 transition-all text-left"
                >
                  {/* subtle texture */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[url('/textures/paper-bg.png')] bg-cover transition-all" />

                  {/* glowing lamp indicator */}
                  <div className="absolute top-6 right-6 opacity-70 text-2xl">🪔</div>

                  <h2 className="text-2xl font-bold text-amber-800 mb-2">{category}</h2>
                  <p className="text-amber-600 text-sm mb-4">{grouped[category].length} भजन उपलब्ध</p>

                  <div className="mt-4 text-xs text-amber-500">देखने के लिए टैप करें</div>

                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-20 opacity-0 group-hover:opacity-60 transform rotate-12 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-tr from-white/30 to-transparent blur-lg rounded-full" />
                  </div>
                </motion.button>
              ))}
            </motion.section>
          )}

          {/* ======= BHAJAN TITLES ======= */}
          {selectedCategory && !selectedBhajan && (
            <motion.section
              key="bhajans"
              variants={fade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-6xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-10">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <ArrowLeft size={18} /> वापस जाएँ
                </button>
                <h2 className={`${heading.className} text-3xl font-bold text-amber-800`}>{selectedCategory}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {grouped[selectedCategory]?.map((b) => (
                  <motion.article
                    key={b._id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedBhajan(b)}
                    className="cursor-pointer rounded-2xl p-6 bg-gradient-to-b from-white to-yellow-50 shadow-lg border border-amber-200 hover:border-amber-400 hover:shadow-amber-200 transition"
                  >
                    <h3 className="text-xl font-semibold text-amber-800 mb-2">{b.title}</h3>
                    <p className="text-amber-600 text-sm line-clamp-3">{b.description || "भजन देखने के लिए क्लिक करें"}</p>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {/* ======= LYRICS VIEW ======= */}
          {selectedBhajan && (
            <motion.section
              key="lyrics"
              variants={fade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-4xl bg-white/90 rounded-3xl p-10 shadow-xl border border-amber-200 backdrop-blur-md relative mx-auto"
            >
              <button
                onClick={() => setSelectedBhajan(null)}
                className="absolute top-6 left-6 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <ArrowLeft size={18} /> पीछे जाएँ
              </button>

              <h2 className={`${heading.className} text-4xl font-bold text-center text-amber-800 mb-6 mt-5 pt-5 drop-shadow-md`}>{selectedBhajan.title}</h2>

              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed text-center whitespace-pre-line" dangerouslySetInnerHTML={{ __html: selectedBhajan.lyrics }} />

              <div className="mt-8 text-center text-sm text-amber-600 italic">श्रेणी: {selectedBhajan.category}</div>

              {/* Action row */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-full bg-amber-100/70">🕉️ प्रिंट</button>
                  <button
                    onClick={() => {
                      // open a share dialog
                      if (navigator.share) {
                        navigator.share({ title: selectedBhajan.title, text: selectedBhajan.lyrics }).catch(() => {});
                      } else {
                        // fallback
                        navigator.clipboard?.writeText(`${selectedBhajan.title}\n\n${selectedBhajan.lyrics}`);
                        alert("Lyrics copied to clipboard");
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-amber-100/70"
                  >
                    ↗️ शेयर करें
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); setPlaying(true); }}} className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white">▶️ सुनें</button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* About section (simple) */}
        <section id="about" className="max-w-7xl mx-auto mt-16">
          <div className="bg-white/80 rounded-2xl p-8 border border-amber-100 shadow-sm">
            <h3 className={`${heading.className} text-2xl mb-2 text-amber-800`}>हमारे बारे में</h3>
            <p className="text-amber-700">यह संग्रह भक्तिमय भजनों के लिए बनाया गया है — साधारण, परिश्रमी और ध्यान केंद्रित अनुभव के साथ।</p>
          </div>
        </section>

      </main>

      {/* Floating diya / scroll to top */}
      <button
        aria-label="scroll to top / diya"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-600 to-yellow-500 p-3 rounded-full shadow-lg hover:scale-110 transition text-white z-50"
      >
        🪔
      </button>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -500px 0; }
          100% { background-position: 500px 0; }
        }
        .animate-shimmer { animation: shimmer 3s linear infinite; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%); background-size: 1000px 100%; }

        @keyframes drift { 0% { transform: translateY(0) translateX(0) rotate(0); } 50% { transform: translateY(-14px) translateX(6px) rotate(2deg); } 100% { transform: translateY(0) translateX(0) rotate(0); } }
        @keyframes driftSlow { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-24px) translateX(-8px); } 100% { transform: translateY(0) translateX(0); } }

        .animate-drift { animation: drift 6.5s ease-in-out infinite; }
        .animate-drift-slow { animation: driftSlow 12s ease-in-out infinite; }
        .animate-drift-wide { animation: drift 9s ease-in-out infinite; }

        /* tiny responsive tweaks */
        .prose { text-align: left; }

        /* line-clamp utility fallback (if not using plugin) */
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </motion.div>
  );
}

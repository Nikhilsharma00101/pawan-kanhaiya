"use client";
/** @jsxImportSource react */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Noto_Serif_Devanagari } from "next/font/google";
import Navbar from "../Navbar";
import RelatedBhajans from "./right-sidebar";
import CategoryBhajans from "./left-sidebar";


const heading = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const body = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
});

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

export default function Hero() {
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
        // Remove corrupted / empty items
const cleaned = data.filter(
  (b) =>
    b.title?.trim() &&
    b.lyrics?.trim() &&
    b.category?.trim()
);

setBhajans(cleaned);

      } catch (err) {
        console.error("Failed to load bhajans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBhajans();
  }, []);

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
      audioRef.current.play().catch(() => { });
      setPlaying(true);
    }
  }

  // ✅ Utility: inject translations only once per full translation block
  function injectTranslations(html: string) {
    if (typeof window === "undefined") return html;

    const container = document.createElement("div");
    container.innerHTML = html;

    // Remove old translation blocks
    container.querySelectorAll(".translation-block").forEach((n) => n.remove());

    const spans = Array.from(container.querySelectorAll("[data-translation]")) as HTMLElement[];

    if (spans.length === 0) return container.innerHTML;

    let group: HTMLElement[] = [];
    let lastTranslation = "";

    const flushGroup = () => {
      if (group.length === 0 || !lastTranslation) return;
      const block = document.createElement("div");
      block.className =
        "translation-block text-amber-700 text-sm mt-2 mb-3 italic border-l-2 border-amber-300 pl-3";
      block.textContent = lastTranslation;
      group[group.length - 1].insertAdjacentElement("afterend", block);
      group = [];
      lastTranslation = "";
    };

    spans.forEach((span, i) => {
      const translation = span.getAttribute("data-translation")?.trim();
      if (!translation) return;

      if (translation === lastTranslation || group.length === 0) {
        group.push(span);
        lastTranslation = translation;
      } else {
        flushGroup();
        group = [span];
        lastTranslation = translation;
      }

      // flush at the end
      if (i === spans.length - 1) flushGroup();
    });

    return container.innerHTML;
  }





  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageFade}
      transition={{ duration: 0.9 }}
      className={`${body.className} min-h-screen bg-gradient-to-b from-[#fff4da] via-[#ffe2aa] to-[#ffd275] text-gray-900 flex flex-col items-center pb-28 relative overflow-x-hidden`}
    >
      {/* Decorations */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-6 top-24 opacity-40 animate-drift-slow text-lg sm:text-xl">
          🪔
        </div>
        <div className="absolute right-12 top-48 opacity-30 animate-drift text-lg sm:text-xl">
          ✨
        </div>
        <div className="absolute left-20 bottom-40 opacity-25 animate-drift-wide text-lg sm:text-xl">
          ✨
        </div>
      </div>

      <audio ref={audioRef} loop src="/audio/soft-chant.mp3" preload="none" />

      {/* Navbar */}
      <Navbar playing={playing} toggleAudio={toggleAudio} />

      {/* =================== MAIN CONTENT =================== */}
      <main className="pt-36 w-full px-6 sm:px-10 md:px-16 lg:px-24 mt-5">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent"
            />
            <p className="text-amber-700 mt-6 font-semibold">
              🔱 भजन लोड हो रहे हैं...
            </p>
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
                <div className="col-span-full text-center text-amber-600 p-10">
                  कोई भजन उपलब्ध नहीं है
                </div>
              )}

              {Object.keys(grouped).map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(category)}
                  className="relative overflow-hidden rounded-3xl shadow-xl border border-amber-300 bg-gradient-to-br from-yellow-50 to-amber-100 text-center py-12 px-6 group hover:shadow-amber-200 transition-all text-left"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[url('/textures/paper-bg.png')] bg-cover transition-all" />
                  <div className="absolute top-6 right-6 opacity-70 text-2xl">
                    🪔
                  </div>

                  <h2 className="text-2xl font-bold text-amber-800 mb-2">
                    {category}
                  </h2>
                  <p className="text-amber-600 text-sm mb-4">
                    {grouped[category].length} भजन उपलब्ध
                  </p>

                  <div className="mt-4 text-xs text-amber-500">
                    देखने के लिए टैप करें
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
                <h2
                  className={`${heading.className} text-3xl font-bold text-amber-800`}
                >
                  {selectedCategory}
                </h2>
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
                    <h3 className="text-xl font-semibold text-amber-800 mb-2">
                      {b.title}
                    </h3>
                    <p className="text-amber-600 text-sm line-clamp-3">
                      {b.description || "भजन देखने के लिए क्लिक करें"}
                    </p>
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
              className="w-full max-w-7xl mx-auto relative"
            >
              {/* LEFT SIDEBAR - Category Bhajans (Fixed - rendered directly) */}
              <CategoryBhajans
                injectTranslations={injectTranslations}
                filterCategories={["राधा भजन", "Krishna Bhajans","राधा कृष्ण भजन लड़ियाँ-1 Em or F#m","राधा कृष्ण भजन लड़ियाँ 2 F#4"]}
              />

              {/* CENTER - Main Lyrics (centered with side margins for sidebars) */}
              <div className="mx-auto max-w-3xl lg:mx-[340px] xl:mx-[295px] bg-white/90 rounded-3xl p-10 shadow-xl border border-amber-200 backdrop-blur-md relative">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedBhajan(null)}
                  className="absolute top-6 left-6 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <ArrowLeft size={18} /> पीछे जाएँ
                </button>

                {/* Title */}
                <h2
                  className={`${heading.className} text-4xl font-bold text-center text-amber-800 mb-6 mt-5 pt-5 drop-shadow-md`}
                >
                  {selectedBhajan.title}
                </h2>

                {/* Lyrics */}
                <div
                  className="lyrics-container prose prose-lg max-w-none text-gray-800 leading-relaxed text-center whitespace-pre-line text-3xl"
                  dangerouslySetInnerHTML={{
                    __html: injectTranslations(selectedBhajan.lyrics),
                  }}
                />

                {/* Category Info */}
                <div className="mt-8 text-center text-sm text-amber-600 italic">
                  श्रेणी: {selectedBhajan.category}
                </div>

                {/* Action Row */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-full bg-amber-100/70">
                      🕉️ प्रिंट
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: selectedBhajan.title,
                              text: selectedBhajan.lyrics,
                            })
                            .catch(() => { });
                        } else {
                          navigator.clipboard?.writeText(
                            `${selectedBhajan.title}\n\n${selectedBhajan.lyrics}`
                          );
                          alert("Lyrics copied to clipboard");
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-amber-100/70"
                    >
                      ↗️ शेयर करें
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.play().catch(() => { });
                          setPlaying(true);
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                    >
                      ▶️ सुनें
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR - Related Bhajans (Fixed - rendered directly) */}
              <RelatedBhajans injectTranslations={injectTranslations} />
            </motion.section>
          )}


        </AnimatePresence>

        {/* About section */}
        <section id="about" className="max-w-2xl mx-auto mt-16">
          <div className="bg-white/80 rounded-2xl p-8 border border-amber-100 shadow-sm">
            <h3
              className={`${heading.className} text-2xl mb-2 text-amber-800`}
            >
              हमारे बारे में
            </h3>
            <p className="text-amber-700">
              यह संग्रह भक्तिमय भजनों के लिए बनाया गया है — साधारण, परिश्रमी
              और ध्यान केंद्रित अनुभव के साथ।
            </p>
          </div>
        </section>
      </main>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface Bhajan {
  _id: string;
  title: string;
  category: string;
  lyrics: string;
  description?: string;
  language?: string;
}

interface CategoryBhajansProps {
  injectTranslations: (html: string) => string;
  filterCategories?: string[];
}

export default function CategoryBhajans({
  injectTranslations,
  filterCategories,
}: CategoryBhajansProps) {
  const [categories, setCategories] = useState<Record<string, Bhajan[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalBhajan, setModalBhajan] = useState<Bhajan | null>(null);

  useEffect(() => {
    const fetchBhajans = async () => {
      try {
        const res = await fetch("/api/bhajans");
        const data: Bhajan[] = await res.json();

        const grouped: Record<string, Bhajan[]> = {};
        data.forEach((b) => {
          const cat = b.category?.trim() || "अन्य भजन";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(b);
        });

        if (filterCategories?.length) {
          const filtered = Object.fromEntries(
            Object.entries(grouped).filter(([cat]) =>
              filterCategories.includes(cat)
            )
          );
          setCategories(filtered);
        } else {
          setCategories(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch bhajans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBhajans();
  }, [filterCategories]);

  return (
    <>
      {/* ✅ Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-10 top-28 w-[300px] xl:w-[350px] max-h-[80vh] overflow-y-auto bg-white/90 rounded-3xl p-5 shadow-xl border border-amber-200 backdrop-blur-md z-30 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        <h3 className="text-amber-800 font-semibold mb-3 text-lg text-center">
          🕉️ भजन श्रेणियाँ
        </h3>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-600 text-sm text-center py-6"
          >
            लोड हो रहा है...
          </motion.p>
        ) : (
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {Object.entries(categories).map(([cat, bhajans], idx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h4 className="font-semibold text-amber-700 mb-2 border-b border-amber-300 pb-1 text-center">
                  {cat}
                </h4>
                <div className="flex flex-col gap-2">
                  {bhajans.map((b) => (
                    <motion.button
                      key={b._id}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setModalBhajan(b)}
                      className="text-left p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 border border-amber-200 text-amber-700 transition shadow-sm hover:shadow-md"
                    >
                      {b.title}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </aside>

      {/* ✅ PREMIUM MODAL */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalBhajan && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalBhajan(null)}
              >
                {/* Decorative Background Shapes */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="absolute top-20 left-20 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </motion.div>

                {/* Modal Card */}
                <motion.div
                  className="relative bg-gradient-to-br from-[#fffbf0] via-[#fff8e8] to-[#fff3d8] rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-amber-200/50 w-[92%] max-w-5xl h-[92vh] overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                    .premium-glow {
                      box-shadow:
                        0 0 20px rgba(251, 191, 36, 0.1),
                        0 0 40px rgba(251, 191, 36, 0.05),
                        inset 0 1px 1px rgba(255, 255, 255, 0.8);
                    }
                  `}</style>

                  {/* Top Gradient Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />

                  {/* Close Button */}
                  <motion.button
                    onClick={() => setModalBhajan(null)}
                    className="absolute top-6 right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/60 text-amber-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-all duration-200 shadow-lg hover:shadow-xl premium-glow"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <X size={22} strokeWidth={2.5} />
                  </motion.button>

                  {/* Scrollable Content */}
                  <div className="h-full overflow-y-auto scrollbar-hide px-8 sm:px-12 md:px-16 py-12">
                    {/* Decorative Icon */}
                    <motion.div
                      className="flex justify-center mb-6"
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30">
                        🕉️
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-3 pt-10"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {modalBhajan.title}
                    </motion.h2>

                    {/* Divider */}
                    <motion.div
                      className="flex items-center justify-center gap-2 mb-8"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300" />
                      <div className="text-amber-400 text-xl">✦</div>
                      <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300" />
                    </motion.div>

                    {/* Category Badge */}
                    <motion.div
                      className="flex justify-center mb-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200/60 shadow-sm">
                        <span className="text-amber-600 font-medium text-sm">
                          श्रेणी: {modalBhajan.category}
                        </span>
                      </div>
                    </motion.div>

                    {/* Lyrics */}
                    <motion.div
                      className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed text-center whitespace-pre-line px-4"
                      dangerouslySetInnerHTML={{
                        __html: injectTranslations(modalBhajan.lyrics),
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    />

                    {/* Bottom Decorative */}
                    <motion.div
                      className="flex justify-center mt-12 mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-3 text-amber-400/40 text-lg">
                        <span>✦</span>
                        <span>🪔</span>
                        <span>✦</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Gradient Fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fff3d8] via-[#fff3d8]/80 to-transparent pointer-events-none" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

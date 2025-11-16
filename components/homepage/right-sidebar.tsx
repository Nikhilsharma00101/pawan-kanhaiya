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

interface RelatedBhajansProps {
  injectTranslations: (html: string) => string;
}

export default function RelatedBhajans({ injectTranslations }: RelatedBhajansProps) {
  const [featured, setFeatured] = useState<Bhajan[]>([]);
  const [modalBhajan, setModalBhajan] = useState<Bhajan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/bhajans/featured");
        const data: Bhajan[] = await res.json();
        setFeatured(data);
      } catch (err) {
        console.error("Failed to load featured bhajans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      {/* ✅ Fixed Sidebar */}
      <aside className="hidden lg:block fixed right-10 top-28 w-[300px] max-h-[80vh] overflow-y-auto bg-white/90 rounded-3xl p-5 shadow-xl border border-amber-200 backdrop-blur-md z-30 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        <h3 className="text-amber-800 font-semibold mb-3 text-lg">✨ सुंदरकांड विशेष भजन</h3>

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
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {featured.map((b, idx) => (
              <motion.button
                key={b._id}
                whileHover={{ scale: 1.03, x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalBhajan(b)}
                className="text-left p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 border border-amber-200 text-amber-700 transition shadow-sm hover:shadow-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {b.title}
              </motion.button>
            ))}
          </motion.div>
        )}
      </aside>

      {/* ✅ Premium Fullscreen Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalBhajan && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalBhajan(null)}
              >
                {/* Floating decorative shapes */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="absolute top-16 left-16 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl animate-slow-spin" />
                  <div className="absolute bottom-20 right-24 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-spin-slow" />
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </motion.div>

                <motion.div
                  className="relative bg-gradient-to-br from-[#fff9f0] via-[#fff4d8] to-[#fff0c5] rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-amber-200/40 w-[92%] max-w-5xl h-[92vh] overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <motion.button
                    onClick={() => setModalBhajan(null)}
                    className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/60 text-amber-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={24} strokeWidth={2.5} />
                  </motion.button>

                  {/* Title */}
                  <motion.h2
                    className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-4 mt-10 drop-shadow-md pt-5"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {modalBhajan.title}
                  </motion.h2>

                  {/* Category Badge */}
                  <motion.div
                    className="flex justify-center mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 shadow-sm">
                      <span className="text-amber-600 font-medium text-sm">
                        श्रेणी: {modalBhajan.category}
                      </span>
                    </div>
                  </motion.div>

                  {/* Lyrics */}
                  <motion.div
                    className="h-[65%] overflow-y-auto px-6 scrollbar-hide prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed text-center whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: injectTranslations(modalBhajan.lyrics),
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />

                  {/* Bottom Glow Divider */}
                  <motion.div
                    className="flex justify-center items-center gap-3 mt-6 mb-6 text-amber-400/50 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <span>✦</span>
                    <span>🪔</span>
                    <span>✦</span>
                  </motion.div>

                  {/* Bottom Gradient Fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fff0c5] via-[#fff0c5]/70 to-transparent pointer-events-none" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

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
      <aside className="hidden lg:block fixed right-10 top-28 w-[300px] max-h-[80vh] overflow-y-auto bg-white/90 rounded-3xl p-5 shadow-xl border border-amber-200 backdrop-blur-md z-30">
        <h3 className="text-amber-800 font-semibold mb-3 text-lg">✨ विशेष भजन</h3>

        {loading ? (
          <p className="text-amber-600 text-sm text-center py-6">लोड हो रहा है...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {featured.map((b) => (
              <motion.button
                key={b._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalBhajan(b)}
                className="text-left p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 border border-amber-200 text-amber-700 transition shadow-sm hover:shadow-md"
              >
                {b.title}
              </motion.button>
            ))}
          </div>
        )}
      </aside>

      {/* ✅ Fullscreen Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalBhajan && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalBhajan(null)}
              >
                <motion.div
                  className="relative bg-gradient-to-br from-[#fff8ee] to-[#fff3cc] rounded-3xl p-8 shadow-2xl border border-amber-300 w-[90%] max-w-4xl h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setModalBhajan(null)}
                    className="absolute top-5 right-5 text-amber-700 hover:text-amber-900 transition"
                  >
                    <X size={26} />
                  </button>

                  <h2 className="text-3xl font-bold text-center text-amber-800 mb-6">
                    {modalBhajan.title}
                  </h2>

                  <div
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed text-center whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: injectTranslations(modalBhajan.lyrics),
                    }}
                  />

                  <div className="mt-6 text-sm text-center text-amber-600 italic">
                    श्रेणी: {modalBhajan.category}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

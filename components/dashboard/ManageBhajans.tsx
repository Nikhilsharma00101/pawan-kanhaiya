"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Edit,
  Trash2,
  X,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpenText,
  Layers,
} from "lucide-react";
import { Playfair_Display, Noto_Serif_Devanagari } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

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
  language?: string;
}

interface BhajanGroups {
  [category: string]: Bhajan[];
}

export default function ManageBhajansAdmin() {
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [editing, setEditing] = useState<Bhajan | null>(null);
  const [form, setForm] = useState<Partial<Bhajan>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Fetch all bhajans
  useEffect(() => {
    const fetchBhajans = async () => {
      try {
        const res = await fetch("/api/bhajans");
        const data = await res.json();
        setBhajans(data);
      } catch (err) {
        console.error("Failed to fetch bhajans", err);
        toast.error("भजन लोड करने में समस्या हुई!");
      } finally {
        setLoading(false);
      }
    };
    fetchBhajans();
  }, []);

  // Prefill edit form (unchanged logic — safe prefill with guarded use of editing._id)
  useEffect(() => {
    if (editing && editing._id) {
      setForm((prev) => ({
        title: editing.title ?? prev.title ?? "",
        category: editing.category ?? prev.category ?? "",
        lyrics:
          editing.lyrics && editing.lyrics.trim() !== ""
            ? editing.lyrics
            : prev.lyrics ?? "",
        description: editing.description ?? prev.description ?? "",
        language: editing.language ?? prev.language ?? "Hindi",
      }));
    } else if (!editing) {
      setForm({});
    }
  }, [editing?._id]);

  const grouped: BhajanGroups = useMemo(
    () =>
      bhajans.reduce((acc, b) => {
        if (!acc[b.category]) acc[b.category] = [];
        acc[b.category].push(b);
        return acc;
      }, {} as BhajanGroups),
    [bhajans]
  );

  const fade = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 18 },
  };

  async function handleDelete(id: string) {
    if (!confirm("क्या आप इस भजन को हटाना चाहते हैं?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/bhajans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBhajans((prev) => prev.filter((b) => b._id !== id));
      setSelectedBhajan(null);
      toast.success("भजन सफलतापूर्वक हटाया गया ✅");
    } catch (err) {
      console.error(err);
      toast.error("भजन हटाने में त्रुटि हुई!");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave() {
    if (!editing) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/bhajans/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();

      // ✅ Update list
      setBhajans((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );

      // ✅ Update selected bhajan if currently viewing
      setSelectedBhajan((prev) =>
        prev && prev._id === updated._id ? updated : prev
      );

      // ✅ Update editing bhajan with new data
      setEditing(updated);

      toast.success("भजन अपडेट किया गया ✅");

      // ✅ Delay close to ensure state sync
      setTimeout(() => {
        setEditing(null);
        setForm({});
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("भजन सेव करने में त्रुटि हुई!");
    } finally {
      setSaving(false);
    }
  }

  const filteredBhajans = useMemo(() => {
    if (!selectedCategory) return [];
    return grouped[selectedCategory]?.filter((b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCategory, grouped, searchQuery]);

  const safeFiltered = filteredBhajans || [];
const totalPages = Math.ceil(safeFiltered.length / perPage) || 1;
const paginated = safeFiltered.slice(
  (page - 1) * perPage,
  page * perPage
);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${body.className} min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center pb-24`}
    >
      <Toaster position="top-right" />

      <main className="pt-20 w-full px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        {/* Dashboard header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`${heading.className} text-3xl md:text-4xl font-bold text-slate-900`}>
                Manage Bhajans
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                View, edit and organize your bhajans. Uses step-wise navigation:
                categories → list → lyrics → edit.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-sm text-slate-500">Total</div>
              <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 text-slate-800 font-semibold">
                {bhajans.length}
              </div>
            </div>
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-sky-600" />
            <p className="text-sky-700 mt-4 font-semibold">Loading bhajans...</p>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {Object.keys(grouped).map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => setSelectedCategory(category)}
                  className="cursor-pointer bg-white border border-slate-100 rounded-2xl shadow-sm p-6 transition"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 mb-3 mx-auto">
                    <Layers className="w-6 h-6 text-sky-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 text-center">{category}</h2>
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    {grouped[category].length} bhajans
                  </p>
                </motion.div>
              ))}
            </motion.section>
          )}

          {/* ======= BHAJAN LIST ======= */}
          {selectedCategory && !selectedBhajan && (
            <motion.section
              key="bhajans"
              variants={fade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-full shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-sm text-slate-700 cursor-pointer">Back</span>
                  </button>
                  <h2 className={`${heading.className} text-2xl font-bold text-slate-900`}>
                    {selectedCategory}
                  </h2>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bhajans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((b) => (
                  <motion.article
                    key={b._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedBhajan(b)}
                    className="cursor-pointer rounded-2xl p-5 bg-white shadow-sm border border-slate-100 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-none w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center">
                        <BookOpenText className="w-6 h-6 text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{b.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-3">{b.description || "Click to view lyrics"}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-full bg-white border border-slate-100 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="font-medium text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-full bg-white border border-slate-100 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
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
              className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mx-auto relative"
            >
              <button
                onClick={() => setSelectedBhajan(null)}
                className="absolute top-6 left-6 flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-full shadow-sm"
              >
                <ArrowLeft size={18} /> <span className="text-sm text-slate-700 cursor-pointer">Back</span>
              </button>

              <h2 className={`${heading.className} text-3xl font-bold text-center text-slate-900 mb-5 mt-10`}>
                {selectedBhajan.title}
              </h2>

              <div
                className="prose prose-lg max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-left"
                dangerouslySetInnerHTML={{ __html: selectedBhajan.lyrics }}
              />

              <div className="mt-6 text-sm text-slate-500 italic">Category: {selectedBhajan.category}</div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setEditing(selectedBhajan)}
                  className="px-4 py-2 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="w-4 h-4 cursor-pointer" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedBhajan._id)}
                  disabled={deletingId === selectedBhajan._id}
                  className="px-4 py-2 rounded-full bg-white text-rose-600 hover:bg-rose-50 border border-rose-100 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === selectedBhajan._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ======= EDIT MODAL (KEEPING LOGIC & BEHAVIOR EXACT) ======= */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-slate-100"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setEditing(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X size={22} />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
                Edit Bhajan
              </h3>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={form.title || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Title"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-100"
                />

                <input
                  value={form.category || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="Category"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full mt-4 p-2 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-sky-100"
              />

              {/* Quill Editor (Render only when lyrics ready) */}
              <div className="mt-4">
                {form.lyrics !== undefined ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[240px]">
                    <ReactQuill
                      key={editing?._id}
                      theme="snow"
                      value={form.lyrics}
                      onChange={(v) => setForm((f) => ({ ...f, lyrics: v }))}
                      className="bg-white rounded-lg"
                      style={{
                        height: "280px",
                        overflowY: "auto",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-slate-500">
                    Loading lyrics...
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-wrap justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

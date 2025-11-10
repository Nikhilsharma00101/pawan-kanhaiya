"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit,
  Music2,
  Loader2,
  CheckSquare,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Bhajan = {
  _id: string;
  title: string;
  category?: string;
  description?: string;
  lyrics: string;
  language?: string;
  createdAt?: string;
};

export default function ManageBhajansAdmin() {
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // editing
  const [editing, setEditing] = useState<Bhajan | null>(null);
  const [form, setForm] = useState<Partial<Bhajan>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // fetch bhajans
  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bhajans");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Bhajan[] = await res.json();
      setBhajans(data);
    } catch (err) {
      console.error("fetchBhajans:", err);
      setBhajans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBhajans();
  }, []);

  // debounce search input for smoother UX
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // derived values
  const uniqueCategories = useMemo(
    () => [...new Set(bhajans.map((b) => b.category).filter(Boolean as any))],
    [bhajans]
  );

  const uniqueLanguages = useMemo(
    () => [...new Set(bhajans.map((b) => b.language || "Hindi").filter(Boolean as any))],
    [bhajans]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return bhajans
      .filter((b) => (categoryFilter ? b.category === categoryFilter : true))
      .filter((b) => (languageFilter ? (b.language || "Hindi") === languageFilter : true))
      .filter(
        (b) =>
          !q ||
          b.title.toLowerCase().includes(q) ||
          (b.lyrics || "").toLowerCase().includes(q) ||
          (b.description || "").toLowerCase().includes(q)
      )
      .sort((a, z) => {
        // latest first by createdAt fallback to title
        const aa = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const zz = z.createdAt ? new Date(z.createdAt).getTime() : 0;
        return zz - aa || a.title.localeCompare(z.title);
      });
  }, [bhajans, debouncedSearch, categoryFilter, languageFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  // delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bhajan permanently?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/bhajans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // optimistic update
      setBhajans((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("delete:", err);
      alert("Failed to delete bhajan");
    } finally {
      setDeletingId(null);
    }
  };

  // open edit modal: populate form
  const openEdit = (b: Bhajan) => {
    setEditing(b);
    setForm({ ...b });
    // small delay not necessary but ensures Quill gets value
    setTimeout(() => {}, 0);
  };

  // inline editing handlers
  const handleFieldChange = (k: keyof Bhajan, v: any) => {
    setForm((cur) => ({ ...cur, [k]: v }));
  };

  // update bhajan — uses PATCH to update only changed fields
  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title ?? editing.title,
        category: form.category ?? editing.category,
        description: form.description ?? editing.description,
        lyrics: form.lyrics ?? editing.lyrics,
        language: form.language ?? editing.language ?? "Hindi",
      };
      const res = await fetch(`/api/bhajans/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Update failed");
      }
      const updated: Bhajan = await res.json();
      // update list
      setBhajans((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setEditing(null);
      setForm({});
    } catch (err) {
      console.error("save:", err);
      alert("Failed to save bhajan");
    } finally {
      setSaving(false);
    }
  };

  // small UI motion variants
  const cardVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading Bhajans...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 sm:px-10 py-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Music2 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Bhajans</h1>
              <p className="text-sm text-gray-500">Admin panel — edit or remove bhajans</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Total Bhajans: <span className="font-medium text-gray-800">{bhajans.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing: <span className="font-medium text-gray-800">{(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total}</span>
            </div>
          </div>
        </div>

        {/* controls: search + filters + perPage */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, lyrics or description..."
                className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:ring-1 focus:ring-blue-200 outline-none text-sm"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
              aria-label="Items per page"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* grid / table section */}
        {pageData.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No bhajans found.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Language</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence initial={false}>
                  {pageData.map((b) => (
                    <motion.tr
                      key={b._id}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={{
                        initial: { opacity: 0, y: 6 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 6 },
                      }}
                      className="border-b last:border-0 hover:bg-white/50"
                    >
                      <td className="px-5 py-4 align-top max-w-[24rem]">
                        <div className="font-medium text-gray-800">{b.title}</div>
                        <div className="text-xs text-gray-500 mt-1">Added: {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"}</div>
                      </td>
                      <td className="px-5 py-4 align-top">{b.category || "Uncategorized"}</td>
                      <td className="px-5 py-4 align-top">{b.language || "Hindi"}</td>
                      <td className="px-5 py-4 align-top">
                        <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: b.description || b.lyrics.slice(0, 220) }} />
                      </td>
                      <td className="px-5 py-4 text-right align-top">
                        <div className="inline-flex items-center gap-2">
                          <button
                            title="Edit"
                            onClick={() => openEdit(b)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>

                          <button
                            title="Delete"
                            onClick={() => handleDelete(b._id)}
                            disabled={deletingId === b._id}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === b._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* pagination controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-800">{(page - 1) * perPage + 1}</span> -{" "}
            <span className="font-medium text-gray-800">{Math.min(page * perPage, total)}</span> of{" "}
            <span className="font-medium text-gray-800">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${page === 1 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "hover:bg-gray-100"}`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* small page numbers (1..n) - show up to 5 pages with sliding window */}
            <div className="flex gap-1">
              {(() => {
                const pages = [];
                const maxButtons = 5;
                let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
                let endPage = startPage + maxButtons - 1;
                if (endPage > totalPages) {
                  endPage = totalPages;
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-3 py-1 rounded-md border ${page === i ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-100"}`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${page === totalPages ? "text-gray-400 border-gray-200 cursor-not-allowed" : "hover:bg-gray-100"}`}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">{editing.title}</h2>
                  <p className="text-sm text-gray-500">Edit bhajan details and lyrics</p>
                </div>

                <div className="text-sm text-gray-500">{editing._id}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  value={form.title ?? editing.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none"
                />

                <div className="flex gap-2">
                  <input
                    value={form.category ?? editing.category ?? ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    placeholder="Category"
                    className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                  <input
                    value={form.language ?? editing.language ?? "Hindi"}
                    onChange={(e) => handleFieldChange("language", e.target.value)}
                    placeholder="Language"
                    className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 outline-none"
                  />
                </div>

                <textarea
                  value={form.description ?? editing.description ?? ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Short description (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none min-h-[72px]"
                />

                <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[220px]">
                  <ReactQuill
                    theme="snow"
                    value={form.lyrics ?? editing.lyrics}
                    onChange={(val: string) => handleFieldChange("lyrics", val)}
                    placeholder="Edit bhajan lyrics..."
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ align: [] }],
                        ["blockquote", "code-block"],
                        [{ color: [] }, { background: [] }],
                        ["link", "clean"],
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({});
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

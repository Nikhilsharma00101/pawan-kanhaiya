"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CheckSquare, Music2, Tag, Type } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function AddBhajanDashboard() {
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>(["#Peace", "#Mantra"]);
  const [newTag, setNewTag] = useState("");
  const [lyrics, setLyrics] = useState("");

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
      setNewTag("");
    }
  };

  const handleSubmit = async () => {
  if (!title || !lyrics) {
    alert("Please fill in at least the Title and Lyrics.");
    return;
  }

  const bhajanData = {
    title,
    category,
    lyrics,
    description: subcategory,
    language: "Hindi",
  };

  try {
    const res = await fetch("/api/bhajans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bhajanData),
    });

    if (res.ok) {
      const savedBhajan = await res.json();
      console.log("✅ Bhajan saved successfully:", savedBhajan);
      alert("Bhajan saved successfully!");
      // reset form
      setTitle("");
      setCategory("");
      setSubcategory("");
      setLyrics("");
      setTags([]);
    } else {
      console.error("❌ Failed to save Bhajan");
      alert("Failed to save bhajan, please try again.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong while saving the bhajan.");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Music2 className="w-7 h-7 text-blue-600" />
              Add New Bhajan
            </h1>
            <p className="text-gray-500 mt-1">
              Create and publish a beautiful new bhajan.
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
          {/* LEFT SECTION - Bhajan Info + Tags */}
          <div className="space-y-8">
            {/* Bhajan Info */}
            <section className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Bhajan Information
              </h2>

              <div className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-600" /> Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Shree Ram Jai Ram Jai Jai Ram"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {/* Subcategory */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Subcategory
                  </label>
                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    type="text"
                    placeholder="Morning Devotion"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">Select a Category</option>
                    <option value="Ram Bhajans">Ram Bhajans</option>
                    <option value="Hanuman Bhajans">Hanuman Bhajans</option>
                    <option value="Krishna Bhajans">Krishna Bhajans</option>
                    <option value="Krishna Bhajans">Sunderkand</option>

                  </select>
                </div>
              </div>
            </section>

            {/* Tags Section */}
            <section className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> Tags
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                >
                  Add
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT SECTION - Lyrics + Publish */}
          <div className="flex flex-col h-full space-y-6">
            <section className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Lyrics Editor
              </h2>

              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={lyrics}
                  onChange={setLyrics}
                  placeholder="Write your bhajan lyrics here... ✨"
                  className="h-full"
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
            </section>

            {/* Publish Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="w-full px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-5 h-5" />
              Publish Bhajan
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CheckSquare, Music2, Type } from "lucide-react";
import registerTranslationBlot from "../TranslationBlot";
import "react-quill-new/dist/quill.snow.css";

// 🧩 Register custom translation blot BEFORE loading ReactQuill
registerTranslationBlot();

// ✅ Dynamically import Quill editor after registering blot
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  { ssr: false }
) as typeof import("react-quill-new").default;

export default function AddBhajanDashboard() {
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [category, setCategory] = useState("");
  const [lyrics, setLyrics] = useState("");
  const quillRef = useRef<any>(null);

  // ✅ Toolbar handler for adding translation
  const addTranslationHandler = function (this: any) {
    const translation = prompt("Enter translation for the selected text:");
    if (!translation) return;

    const range = this.quill.getSelection();
    if (range && range.length > 0) {
      this.quill.formatText(range.index, range.length, "translation", translation);
    } else {
      alert("Please select some text first.");
    }
  };

  // ✅ Quill modules configuration (toolbar + handler)
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        ["link", "clean"],
        ["addTranslation"], // 🌐 our custom button
      ],
      handlers: {
        addTranslation: addTranslationHandler,
      },
    },
  };

  // ✅ Save bhajan to backend
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
        alert("✅ Bhajan saved successfully!");
        setTitle("");
        setCategory("");
        setSubcategory("");
        setLyrics("");
      } else {
        alert("❌ Failed to save bhajan, please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong while saving the bhajan.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Music2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              Add New Bhajan
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Create and publish a beautiful new bhajan.
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10 p-6 sm:p-10">
          {/* LEFT SECTION */}
          <div className="space-y-8">
            <section className="bg-gray-50/60 border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none text-sm sm:text-base"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none text-sm sm:text-base"
                  >
                    <option value="">Select a Category</option>
<option value="Ram Bhajans">Ram Bhajans</option>
<option value="Hanuman Bhajans">Hanuman Bhajans</option>
<option value="Krishna Bhajans">Krishna Bhajans</option>
<option value="Shiv Bhajans">Shiv Bhajans</option>
<option value="Vishnu Bhajans">Vishnu Bhajans</option>
<option value="Durga Bhajans">Durga Bhajans</option>
<option value="Lakshmi Bhajans">Lakshmi Bhajans</option>
<option value="Saraswati Bhajans">Saraswati Bhajans</option>
<option value="Ganesh Bhajans">Ganesh Bhajans</option>
<option value="Mata Rani Bhajans">Mata Rani Bhajans</option>
<option value="Kali Bhajans">Kali Bhajans</option>
<option value="Sunderkand">Sunderkand</option>
<option value="Aarti">Aarti</option>
<option value="Mantras">Mantras</option>
<option value="Stotra">Stotra</option>
<option value="Bhakti Songs">Bhakti Songs</option>
<option value="Festival Bhajans">Festival Bhajans</option>
<option value="Morning Bhajans">Morning Bhajans</option>
<option value="Evening Bhajans">Evening Bhajans</option>
<option value="Meditation & Peace">Meditation & Peace</option>
<option value="Devotional Classics">Devotional Classics</option>





                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex flex-col h-full space-y-6">
            <section className="bg-gray-50/60 border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Lyrics Editor
              </h2>

              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden min-h-[300px] sm:min-h-[400px]">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={lyrics}
                  onChange={setLyrics}
                  placeholder="Write your bhajan lyrics here... ✨"
                  className="h-full"
                  modules={modules}
                />
              </div>
            </section>

            {/* Publish Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
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

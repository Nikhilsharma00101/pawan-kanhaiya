"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, GripVertical } from "lucide-react";
import { Playfair_Display, Noto_Serif_Devanagari } from "next/font/google";

const heading = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const body = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
});

/* ================= TYPES ================= */

export interface Bhajan {
  _id: string;
  title: string;
  lyrics: string;
  category: string;
  description?: string;
  order?: number;
}

export interface BhajanPart {
  _id: string;
  title: string;
  order: number;
  bhajans: Bhajan[];
}

/* ================= BREAKPOINT ================= */

function useBreakpoint() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    h();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return {
    isDesktop: width >= 1024,
    isTablet: width >= 768 && width < 1024,
    isMobile: width < 768,
  };
}

/* ================= SORTABLE ROW ================= */

function SortableBhajanRow({
  bhajan,
  active,
  onSelect,
}: {
  bhajan: Bhajan;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: bhajan._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border
      ${active
          ? "bg-amber-100 border-amber-400"
          : "bg-white/80 border-amber-200 hover:bg-amber-50"
        }`}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-amber-600"
      >
        <GripVertical size={16} />
      </span>
      <span className="text-amber-800 font-medium text-sm">
        {bhajan.title}
      </span>
    </div>
  );
}

/* ================= MAIN ================= */

export default function LaddiHero() {
  const { isDesktop } = useBreakpoint();

  const [parts, setParts] = useState<BhajanPart[]>([]);
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [showList, setShowList] = useState(true);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/laddi");
      const data: BhajanPart[] = await res.json();
      setParts(data);
    }

    load();
  }, []);

  /* ---------- DND ---------- */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let sourcePartId: string | null = null;
    let targetPartId: string | null = null;

    parts.forEach((p) => {
      if (p.bhajans.some((b) => b._id === active.id)) sourcePartId = p._id;
      if (p.bhajans.some((b) => b._id === over.id)) targetPartId = p._id;
    });

    if (!sourcePartId || !targetPartId) return;

    const sourcePart = parts.find((p) => p._id === sourcePartId)!;
    const targetPart = parts.find((p) => p._id === targetPartId)!;

    const sourceIndex = sourcePart.bhajans.findIndex(
      (b) => b._id === active.id
    );
    const targetIndex = targetPart.bhajans.findIndex(
      (b) => b._id === over.id
    );

    // 🔥 optimistic update
    setParts((prev) => {
      const clone = structuredClone(prev);
      const src = clone.find((p) => p._id === sourcePartId)!;
      const tgt = clone.find((p) => p._id === targetPartId)!;

      const [moved] = src.bhajans.splice(sourceIndex, 1);
      tgt.bhajans.splice(targetIndex, 0, moved);

      return clone;
    });

    // 🔥 persist
    await fetch("/api/laddi/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourcePartId,
        targetPartId,
        activeId: active.id,
        overId: over.id,
      }),
    });

  }

  /* ---------- RENDER ---------- */

  const BhajanList = (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
      {parts.map((part) => (
        <div key={part._id}>
          <h3 className="text-lg font-bold text-amber-800 mb-3">
            {part.title}
          </h3>

          <SortableContext
            items={part.bhajans.map((b) => b._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {part.bhajans.map((b) => (
                <SortableBhajanRow
                  key={b._id}
                  bhajan={b}
                  active={selectedBhajan?._id === b._id}
                  onSelect={() => {
                    setSelectedBhajan(b);
                    if (!isDesktop) setShowList(false);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      ))}
    </div>
  );

  const LyricsView = selectedBhajan && (
    <div className="bg-white/90 rounded-3xl p-8 shadow-xl border border-amber-200">
      {!isDesktop && (
        <button
          onClick={() => setShowList(true)}
          className="mb-4 flex items-center gap-2 text-amber-700"
        >
          <ArrowLeft size={18} /> भजन सूची
        </button>
      )}

      <h2
        className={`${heading.className} text-3xl text-center text-amber-800 mb-6`}
      >
        {selectedBhajan.title}
      </h2>

      <div
        className="prose prose-lg max-w-none text-center text-2xl"
        dangerouslySetInnerHTML={{ __html: selectedBhajan.lyrics }}
      />
    </div>
  );

  return (
    <section
      className={`${body.className} min-h-screen bg-gradient-to-b from-[#fff4da] via-[#ffe2aa] to-[#ffd275] px-6 py-28`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`${heading.className} text-4xl text-center text-amber-900 mb-10`}
        >
          🎶 भजन लड़ी
        </h1>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {isDesktop ? (
            <div className="grid grid-cols-[3fr_1.4fr] gap-8">
              {LyricsView}
              <aside className="bg-white/70 rounded-3xl p-6 border border-amber-200 shadow">
                {BhajanList}
              </aside>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {showList ? (
                <motion.div key="list">{BhajanList}</motion.div>
              ) : (
                <motion.div key="lyrics">{LyricsView}</motion.div>
              )}
            </AnimatePresence>
          )}
        </DndContext>
      </div>
    </section>
  );
}

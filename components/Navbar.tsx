"use client";

import Image from "next/image";
import { LayoutDashboard } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const heading = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

export default function Navbar({
  playing,
  toggleAudio,
}: {
  playing: boolean;
  toggleAudio: () => void;
}) {
  return (
    <header className="fixed top-2 sm:top-4 left-0 w-full px-4 sm:px-6 md:px-12 z-50">
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="flex items-center gap-3 flex-shrink">
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="logo"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h1
              className={`${heading.className} text-xl sm:text-2xl md:text-3xl text-amber-800 font-bold tracking-wide`}
            >
              🪔 श्री भजन संग्रह
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-600/90">
              आध्यात्मिक भक्ति — शांति और श्रवण
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-amber-700 font-medium w-full sm:w-auto justify-end">
          <a
            href="#categories"
            className="hover:text-amber-900 transition text-sm md:text-base"
          >
            भजन श्रेणियाँ
          </a>
          <a
            href="#about"
            className="hover:text-amber-900 transition text-sm md:text-base"
          >
            हमारे बारे में
          </a>
          <button
            onClick={toggleAudio}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-100/60 hover:bg-amber-100/90 transition shadow-inner text-sm"
            aria-pressed={playing}
          >
            {playing ? "🔇 संगीत बंद करें" : "🎶 शांत संगीत"}
          </button>

          {/* Dashboard CTA */}
          <div className="flex items-center">
            {/* Desktop */}
            <a
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white rounded-full shadow-lg hover:scale-105 transition-all text-sm sm:text-base"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-semibold">Dashboard</span>
            </a>

            {/* Mobile */}
            <a
              href="/dashboard"
              className="flex sm:hidden items-center justify-center p-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white rounded-full shadow-lg hover:scale-110 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

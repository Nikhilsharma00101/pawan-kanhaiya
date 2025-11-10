"use client";

import {
  LayoutDashboard,
  Library,
  PlusCircle,
  Folder,
  BarChart3,
} from "lucide-react";
import React from "react";

interface Tab {
  name: string;
  icon: React.ElementType;
}

interface DashboardManagerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs: Tab[] = [
  { name: "Add Bhajans", icon: PlusCircle },
  { name: "Manage Bhajans", icon: LayoutDashboard },
  { name: "Media Library", icon: Library },
  { name: "Categories", icon: Folder },
  { name: "Analytics", icon: BarChart3 },
];

export default function DashboardManager({
  activeTab,
  setActiveTab,
}: DashboardManagerProps) {
  return (
    <>
      {/* 🖥️ Desktop & Tablet Sidebar (Fixed) */}
      <aside
        className="hidden sm:flex fixed left-0 top-0 h-screen w-64 
        bg-white shadow-xl border-r border-gray-100 
        flex-col justify-between p-4 z-50"
      >
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-center text-gray-700">
            🧘 Dashboard
          </h2>

          {/* Navigation Tabs */}
          <ul className="space-y-2">
            {tabs.map(({ name, icon: Icon }) => (
              <li key={name}>
                <button
                  onClick={() => setActiveTab(name)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${
                      activeTab === name
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Bhajan Admin
        </div>
      </aside>

      {/* 📱 Mobile Bottom Navigation (Fixed) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 w-full bg-white 
        border-t border-gray-200 shadow-lg flex justify-around items-center 
        py-2 z-50 rounded-t-2xl"
      >
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex flex-col items-center justify-center text-xs transition-all ${
              activeTab === name
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{name.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

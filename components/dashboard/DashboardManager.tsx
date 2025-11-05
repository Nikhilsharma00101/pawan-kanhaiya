"use client";

import { LayoutDashboard, Library, PlusCircle, Folder, BarChart3 } from "lucide-react";

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

export default function DashboardManager({ activeTab, setActiveTab }: DashboardManagerProps) {
  return (
    <aside className="w-64 bg-white shadow-lg rounded-2xl h-screen p-4 flex flex-col justify-between border border-gray-100 ">
      <div>
        <h2 className="text-xl font-bold mb-6 text-center text-gray-700">🧘 Dashboard</h2>

        <ul className="space-y-2">
          {tabs.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button
                onClick={() => setActiveTab(name)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    activeTab === name
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Bhajan Admin
      </div>
    </aside>
  );
}

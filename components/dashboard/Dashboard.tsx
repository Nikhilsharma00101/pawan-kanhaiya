"use client";

import { useState } from "react";
import DashboardManager from "./DashboardManager";
import AddBhajanDashboard from "./AddBhajan";
import ManageBhajans from "./ManageBhajans";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Add Bhajans");

  const renderContent = () => {
    switch (activeTab) {
      case "Add Bhajans":
        return <AddBhajanDashboard />;
      case "Manage Bhajans":
        return <ManageBhajans />;
      case "Media Library":
        return (
          <div className="p-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Media Library
            </h2>
            <p className="text-gray-500">Upload and manage media here.</p>
          </div>
        );
      case "Categories":
        return (
          <div className="p-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Categories
            </h2>
            <p className="text-gray-500">Organize your bhajans into categories.</p>
          </div>
        );
      case "Analytics":
        return (
          <div className="p-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Analytics
            </h2>
            <p className="text-gray-500">Track insights and performance here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardManager activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main
        className="
          flex-1 
          overflow-y-auto 
          p-4 
          sm:ml-64      /*  prevent overlap on desktop */
          pb-16         /*  avoid hiding behind mobile nav */
        "
      >
        {renderContent()}
      </main>
    </div>
  );
}

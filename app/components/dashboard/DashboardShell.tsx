"use client";

import { useState } from "react";
import DashboardNav from "./DashboardNav";
import FeaturePanel from "./FeaturePanel";
import MapSection from "./MapSection";
import ItineraryPlanner from "./features/ItineraryPlanner";
import Bookings from "./features/Bookings";
import ExploringFood from "./features/ExploringFood";
import PackingChecklist from "./features/PackingChecklist";
import DocumentManager from "./features/DocumentManager";
import ChatRoom from "./features/ChatRoom";
import type { Room, UserProfile } from "@/types";

interface DashboardShellProps {
  room: Room;
  user: UserProfile;
}

export default function DashboardShell({ room, user }: DashboardShellProps) {
  const [selectedFeature, setSelectedFeature] = useState("itinerary");
  const [location, setLocation] = useState(room.destination || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const featureProps = { room, user, onLocationChange: setLocation };

  const renderFeature = () => {
    switch (selectedFeature) {
      case "itinerary":
        return <ItineraryPlanner {...featureProps} />;
      case "bookings":
        return <Bookings {...featureProps} />;
      case "food":
        return <ExploringFood {...featureProps} />;
      case "packing":
        return <PackingChecklist {...featureProps} />;
      case "documents":
        return <DocumentManager {...featureProps} />;
      case "chat":
        return <ChatRoom {...featureProps} />;
      default:
        return <ItineraryPlanner {...featureProps} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <DashboardNav
        room={room}
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex overflow-hidden">
        <FeaturePanel
          selectedFeature={selectedFeature}
          onSelect={(f) => {
            setSelectedFeature(f);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">{renderFeature()}</div>
        </main>
        <div className="hidden lg:block w-[35%] border-l">
          <MapSection location={location} />
        </div>
      </div>
    </div>
  );
}

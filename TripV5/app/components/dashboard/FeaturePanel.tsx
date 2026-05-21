"use client";

import {
  Map,
  Plane,
  Utensils,
  PackageCheck,
  FileText,
  MessageSquare,
  X,
} from "lucide-react";

const features = [
  { id: "itinerary", name: "Itinerary", icon: Map },
  { id: "bookings", name: "Bookings", icon: Plane },
  { id: "food", name: "Food", icon: Utensils },
  { id: "packing", name: "Packing", icon: PackageCheck },
  { id: "documents", name: "Documents", icon: FileText },
  { id: "chat", name: "Chat", icon: MessageSquare },
];

interface FeaturePanelProps {
  selectedFeature: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturePanel({
  selectedFeature,
  onSelect,
  isOpen,
  onClose,
}: FeaturePanelProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-60 lg:w-16 xl:w-56
          bg-white border-r
          transform transition-transform duration-200 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold text-gray-900">Features</span>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {features.map((f) => {
            const Icon = f.icon;
            const isActive = selectedFeature === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={f.name}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-teal-600" : ""
                  }`}
                />
                {/* Show label on mobile overlay & xl+ screens */}
                <span className="lg:hidden xl:inline">{f.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

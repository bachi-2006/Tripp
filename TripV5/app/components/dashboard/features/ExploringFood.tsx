"use client";

import { useState } from "react";
import { MapPin, Star, Loader2, Sparkles } from "lucide-react";
import type { DashboardFeatureProps, Restaurant } from "@/types";

export default function ExploringFood({
  room,
  onLocationChange,
}: DashboardFeatureProps) {
  const [destination, setDestination] = useState(room.destination || "");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchFood = async () => {
    if (!destination) return;
    setLoading(true);
    setError("");
    onLocationChange(destination);

    try {
      const res = await fetch("/api/ai/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRestaurants(data.restaurants || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Exploring Food</h2>
        <p className="text-gray-500 mt-1">
          Discover the best local cuisine with AI
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Search by city..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && searchFood()}
            />
          </div>
          <button
            onClick={searchFood}
            disabled={!destination || loading}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {restaurants.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.cuisine}</p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {r.price_range}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{r.description}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-gray-700">
                  {r.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

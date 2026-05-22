"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";
import type { DashboardFeatureProps, ItineraryDay } from "@/types";

export default function ItineraryPlanner({
  room,
  onLocationChange,
}: DashboardFeatureProps) {
  const [destination, setDestination] = useState(room.destination || "");
  const [days, setDays] = useState(room.days || 3);
  const [travelers, setTravelers] = useState(1);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateItinerary = async () => {
    if (!destination) return;
    setLoading(true);
    setError("");
    onLocationChange(destination);

    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, travelers }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItinerary(data.itinerary || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Itinerary Planner
        </h2>
        <p className="text-gray-500 mt-1">
          Generate an AI-powered travel itinerary
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                min={1}
                max={30}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={generateItinerary}
          disabled={!destination || loading}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Itinerary
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Itinerary display */}
      {itinerary.length > 0 && (
        <div className="space-y-4">
          {itinerary.map((day) => (
            <div
              key={day.day}
              className="bg-white rounded-xl border overflow-hidden"
            >
              <div className="bg-teal-50 px-6 py-3 border-b">
                <h3 className="font-semibold text-teal-900">
                  Day {day.day}: {day.title}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {day.activities?.map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-teal-600" />
                      </div>
                      {i < (day.activities?.length || 0) - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                          {activity.time}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {activity.type}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {activity.description}
                      </p>
                      {activity.location && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {activity.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

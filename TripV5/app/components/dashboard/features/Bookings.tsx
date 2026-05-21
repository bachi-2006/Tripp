"use client";

import { useState } from "react";
import { Plane, ExternalLink, Loader2, Clock } from "lucide-react";
import type { DashboardFeatureProps } from "@/types";
import { searchFlights, type Flight } from "@/lib/services/mockFlights";

export default function Bookings({ room, onLocationChange }: DashboardFeatureProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(room.destination || "");
  const [date, setDate] = useState("");

  // Flight Search State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchFlights(origin, destination, date || "any");
      setFlights(results);
      onLocationChange(destination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}${date ? `+on+${date}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings & Flights</h2>
        <p className="text-gray-500 mt-1">Search estimates and book real flights</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin city"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination city"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !origin || !destination}
          className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
          Find Flights
        </button>
      </div>

      {/* Results Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : hasSearched && flights.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Estimated Prices</h3>
          <div className="grid gap-4">
            {flights.map((flight) => (
              <div key={flight.id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{flight.airline}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {flight.departure} - {flight.arrival}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-teal-600">${flight.price}</span>
                    <span className="text-xs text-gray-400">avg. per person</span>
                  </div>
                  <a
                    href={flight.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Book
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            * Prices are estimates based on historical data. Click &quot;Book&quot; to see real-time pricing on Google Flights.
          </p>
        </div>
      ) : null}

      {/* External Links */}
      <div className="grid grid-cols-1 gap-4 pt-4 border-t">
        <a
          href={googleFlightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Open Google Flights</span>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>
    </div>
  );
}
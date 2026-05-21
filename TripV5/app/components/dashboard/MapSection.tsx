"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapSectionProps {
  location: string;
}

export default function MapSection({ location }: MapSectionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 20],
      zoom: 2,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "bottom-right"
    );
    map.current.on("load", () => setMapReady(true));

    return () => {
      map.current?.remove();
    };
  }, [token]);

  useEffect(() => {
    if (!mapReady || !location || !map.current) return;

    const geocode = async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(location)}`
        );
        const data = await res.json();
        if (data.lat && data.lng) {
          map.current?.flyTo({
            center: [data.lng, data.lat],
            zoom: 10,
            duration: 2000,
          });
          marker.current?.remove();
          marker.current = new mapboxgl.Marker({ color: "#0d9488" })
            .setLngLat([data.lng, data.lat])
            .setPopup(new mapboxgl.Popup().setText(location))
            .addTo(map.current!);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    geocode();
  }, [location, mapReady]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm text-center p-6">
        <div>
          <p className="font-medium mb-1">Map unavailable</p>
          <p className="text-xs">
            Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full" />;
}

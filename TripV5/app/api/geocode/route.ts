import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Geocoding not configured. Set GEOAPIFY_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        q
      )}&limit=1&apiKey=${apiKey}`
    );
    const data = await res.json();
    const result = data.features?.[0]?.properties;

    if (result) {
      return NextResponse.json({
        lat: result.lat,
        lng: result.lon,
        formatted: result.formatted,
      });
    }

    return NextResponse.json(
      { error: "Location not found" },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getPlaces } from "@/lib/services/geoapify";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const { destination } = await req.json();

    // 1. Try Real Data First (if Geoapify key is set)
    if (process.env.GEOAPIFY_API_KEY) {
      const realPlaces = await getPlaces(destination, "catering.restaurant");
      if (realPlaces && realPlaces.length > 0) {
        return NextResponse.json({ restaurants: realPlaces, source: "real-data" });
      }
    }

    // 2. Fallback to AI
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI not configured. Set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Recommend 6 must-try restaurants in ${destination}.
    Format as JSON array:
    [{
      "name": "Name",
      "cuisine": "Type",
      "rating": 4.5,
      "price_range": "$$",
      "description": "Short description"
    }]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return NextResponse.json({ restaurants: JSON.parse(jsonMatch[0]), source: "ai" });
    }

    return NextResponse.json({ restaurants: [], raw: text });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
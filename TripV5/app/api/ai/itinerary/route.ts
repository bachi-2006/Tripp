import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured. Set GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { destination, days, travelers } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a detailed ${days}-day travel itinerary for ${travelers} traveler(s) visiting ${destination}.

For each day, provide:
- A creative day title/theme
- 3-4 activities with specific times, names, descriptions, and locations
- A mix of attractions, food, and cultural experiences

Format as a JSON array:
[{
  "day": 1,
  "title": "Day Title",
  "activities": [{
    "time": "09:00",
    "title": "Activity Name",
    "description": "Brief description",
    "location": "Specific location name",
    "type": "attraction"
  }]
}]

The "type" field must be one of: "attraction", "food", "transport", "hotel", "activity".
Return ONLY valid JSON, no markdown fences or extra text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const itinerary = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ itinerary });
    }

    return NextResponse.json({ itinerary: [], raw: text });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

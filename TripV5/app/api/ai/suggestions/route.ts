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
    const { destination } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `For a trip to ${destination}, provide:
1. 5 must-visit tourist attractions
2. 3 recommended stays (budget, mid-range, luxury)
3. Best time to visit
4. 3 local tips

Format as JSON:
{
  "attractions": [{ "name": "", "description": "" }],
  "stays": [{ "name": "", "type": "budget|mid-range|luxury", "description": "" }],
  "bestTime": "",
  "tips": [""]
}

Return ONLY valid JSON, no markdown fences or extra text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return NextResponse.json(suggestions);
    }

    return NextResponse.json({ raw: text });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

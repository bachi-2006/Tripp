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
    const { message, destination } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are Tripp AI, a helpful and friendly travel assistant. The user is planning a trip${destination ? ` to ${destination}` : ""}.

User message: ${message}

Respond helpfully and concisely. If asked about travel, provide specific, practical recommendations. Keep your response under 200 words.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ reply: text });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI chat failed" },
      { status: 500 }
    );
  }
}

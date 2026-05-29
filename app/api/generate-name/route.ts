import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ??
    process.env.OPENROUTER_API_KEY ??
    "",
  baseURL: "https://openrouter.ai/api/v1",
});

const DEFAULT_MODEL =
  process.env.OPENAI_MODEL ??
  process.env.OPENROUTER_MODEL ??
  "openai/gpt-oss-120b:free";

export async function POST(request: Request) {
  try {
    const { emojis } = await request.json();
    if (!Array.isArray(emojis) || emojis.length !== 3) {
      return NextResponse.json({ error: "Three emojis required" }, { status: 400 });
    }

    if (!openai.apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const systemPrompt = `
You are a naming AI. Convert 3 emojis into a single short SNS slug (we append the real suffix in code).
Rules:
- Lowercase only
- No spaces or special characters
- Max 12 characters for the slug (before any suffix)
- End with .sol in your answer (we may rewrite to *.paymoji.sol for on-chain registration)
- Dont just clump the emoji names together — reason about the emojis and pick a memorable slug.
- Return ONLY the name. No explanation, no punctuation, just the name.
Examples: cosmos.sol, tigershock.sol, foxwave.sol
`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Emojis: ${emojis.join("")}` },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const name = raw.replace(/\s+/g, "").toLowerCase();
    const withSol = name.endsWith(".sol") ? name : `${name}.sol`;

    return NextResponse.json({ name: withSol });
  } catch (err) {
    console.error("[generate-name]", err);
    return NextResponse.json({ error: "Name generation failed" }, { status: 500 });
  }
}

import "server-only";
import OpenAI from "openai";
import { resolvePaymojiSnsDomain } from "@/lib/paymojiSns";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "",
  baseURL: "https://openrouter.ai/api/v1",
});

const DEFAULT_MODEL =
  process.env.OPENAI_MODEL ??
  process.env.OPENROUTER_MODEL ??
  "openai/gpt-oss-120b:free";

export async function chatCompletion(params: {
  model?: string;
  systemPrompt: string;
  userMessage: string;
}): Promise<string> {
  const { model = DEFAULT_MODEL, systemPrompt, userMessage } = params;

  if (!openai.apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const stream = await openai.chat.completions.create({
    model,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) fullResponse += content;
  }

  return fullResponse.trim();
}

export async function generateSolName(emojis: string[]): Promise<string> {
  if (emojis.length !== 3) {
    throw new Error("Exactly three emojis are required");
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

  const userMessage = `Emojis: ${emojis.join("")}`;

  const raw = await chatCompletion({ systemPrompt, userMessage });
  const name = raw.replace(/\s+/g, "").toLowerCase();
  const withSol = name.endsWith(".sol") ? name : `${name}.sol`;
  return resolvePaymojiSnsDomain(withSol);
}

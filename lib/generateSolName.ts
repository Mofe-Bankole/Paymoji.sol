import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ??
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ??
    "",
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

const DEFAULT_MODEL =
  process.env.NEXT_PUBLIC_OPENAI_MODEL ??
  process.env.NEXT_PUBLIC_OPENROUTER_MODEL ??
  "openai/gpt-oss-120b:free";

/**
 * Generic chat‑completion helper that streams the response.
 *
 * @param params.model        – optional model override
 * @param params.systemPrompt – system instruction for the LLM
 * @param params.userMessage  – the user‑facing prompt
 * @returns The full assembled response string.
 */
export async function chatCompletion(params: {
  model?: string;
  systemPrompt: string;
  userMessage: string;
}): Promise<string> {
  const { model = DEFAULT_MODEL, systemPrompt, userMessage } = params;

  if (!openai.apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  // OpenAI SDK streaming call
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

    // Final chunk includes usage data – log reasoning tokens
    if (chunk.usage) {
      console.log("\nReasoning tokens:", chunk.usage.completion_tokens);
    }
  }

  return fullResponse.trim();
}

/**
 * Generate a concise `.sol` name from exactly three emojis.
 *
 * @param emojis - Array of three emoji strings, e.g. ["🚀","🦄","🔥"]
 * @returns A short, lower‑case name ending with `.sol`
 */
export async function generateSolName(emojis: string[]): Promise<string> {
  if (emojis.length !== 3) {
    throw new Error("Exactly three emojis are required");
  }

  const systemPrompt = `
You are a naming AI. Convert 3 emojis into a single short .sol name.
Rules:
- Lowercase only
- No spaces or special characters
- Max 15 characters before .sol
- End with .sol
- Dont just clump the emoji names together , take some time to reason about the emojis and come up with a name that makes sense.
- You can use adjectives to describe the emojis and come up with a more meaningful name.
- Return ONLY the name. No explanation, no punctuation, just the name.
Examples: cosmos.sol, tigershock.sol, foxwave.sol
`;

  const userMessage = `Emojis: ${emojis.join("")}`;

  const raw = await chatCompletion({ systemPrompt, userMessage });
  const name = raw.replace(/\s+/g, "").toLowerCase();
  console.log(name);
  return name.endsWith(".sol") ? name : `${name}.sol`;
}

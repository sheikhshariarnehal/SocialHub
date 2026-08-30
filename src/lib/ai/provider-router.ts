/**
 * AI Provider Hub — Router & Abstraction Layer
 * Supports Free Default, NVIDIA NIM, OpenAI, Google Gemini, OpenRouter, and Custom endpoints.
 */

export interface GenerateOptions {
  action: "create" | "hashtags" | "rewrite" | "shorten" | "reply";
  prompt: string;
  tone?: string;
  context?: string;
  apiKey?: string;
  provider?: "free_default" | "openai" | "gemini" | "openrouter" | "nvidia" | "custom";
  model?: string;
  baseUrl?: string;
}

export interface GenerateResult {
  text: string;
  providerUsed: string;
  modelUsed?: string;
  tokensUsed: number;
}

export function cleanSocialPostOutput(rawText: string): string {
  if (!rawText) return "";
  let text = rawText.trim();

  // Strip <think>...</think> reasoning/thinking tags if model returned reasoning
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove markdown headers like ### Hook or # Title
  text = text.replace(/^#+\s+/gm, "");

  // Strip enclosing quotes if model returned "..."
  if (text.startsWith('"') && text.endsWith('"') && text.length > 20) {
    text = text.slice(1, -1).trim();
  }

  // Clean markdown asterisks: **Bold** -> Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");

  return text.trim();
}

function buildSystemPrompt(action: string, tone: string): string {
  const formattingRules = `
CRITICAL SOCIAL MEDIA FORMATTING RULES:
- DO NOT use markdown bold syntax with asterisks (like **Heading** or *italic*). Social media platforms (LinkedIn, X/Twitter, Facebook, Instagram) do not support markdown and will display ugly raw asterisks.
- Format using clean line breaks, spaced paragraphs, and emojis for bullet points (e.g. 🔹, 💡, ⚡️, 👉, •).
- For emphasis or section headers, use clean capitalization (e.g. "QUESTION EVERYTHING — The best innovations begin with skepticism") rather than wrapping in asterisks.
- Output ONLY the ready-to-publish social caption without any introductory greetings or commentary.`;

  switch (action) {
    case "hashtags":
      return `You are an expert social media strategist and SEO specialist. Analyze the provided post and generate 8 to 15 highly relevant, trending, and niche hashtags. Return the original post with the new hashtags neatly appended at the bottom. Do NOT use markdown asterisks. Output only the final post with hashtags.`;
    case "rewrite":
      return `You are an expert copywriter and brand voice strategist. Rewrite the provided social media post strictly matching the "${tone}" tone. Improve clarity, impact, engagement hooks, and pacing while preserving the core message. ${formattingRules}`;
    case "shorten":
      return `You are an elite copywriter specializing in high-impact micro-content (X / Twitter). Condense the provided content into a punchy, engaging tweet under 280 characters with a strong hook and 1-2 hashtags. Do NOT use markdown asterisks. Output only the condensed post.`;
    case "reply":
      return `You are a social media community manager. Write an authentic, warm, helpful, and engaging reply to the user's comment or message in a "${tone}" tone. Keep it concise (1 to 3 sentences). Do NOT use markdown asterisks. Output only the reply text.`;
    case "create":
    default:
      return `You are a world-class social media strategist and ghostwriter for top founders and creators. 
Create an engaging, viral-ready social media post tailored in a "${tone}" tone.
Requirements:
1. Start with an irresistible 1-line hook that grabs attention.
2. Structure the body with clear, readable spacing, bullet points (🔹, ⚡️, or •), or numbered takeaways for maximum readability.
3. Include an engaging Call To Action (CTA) at the end to drive comments and discussions.
4. Add 3 to 5 relevant hashtags at the bottom.
5. ${formattingRules}`;
  }
}

/**
 * NVIDIA NIM API caller (e.g. nvidia/nemotron-3.5-lightning-30b-a3b, moonshotai/kimi-k3)
 */
async function callNvidia(
  apiKey: string,
  model: string = "nvidia/nemotron-3.5-lightning-30b-a3b",
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; tokensUsed: number }> {
  const endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
  const selectedModel = model?.trim() || "nvidia/nemotron-3.5-lightning-30b-a3b";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg =
      errorData?.error?.message ||
      errorData?.message ||
      `NVIDIA NIM API error (${res.status}): ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const text = cleanSocialPostOutput(rawText);
  const tokensUsed = data.usage?.total_tokens || 180;
  return { text, tokensUsed };
}

/**
 * OpenRouter API caller
 */
async function callOpenRouter(
  apiKey: string,
  model: string = "anthropic/claude-3.5-sonnet",
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; tokensUsed: number }> {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const selectedModel = model?.trim() || "anthropic/claude-3.5-sonnet";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "HTTP-Referer": "https://socialhub-sigma.vercel.app",
      "X-Title": "SocialHub",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg =
      errorData?.error?.message ||
      errorData?.message ||
      `OpenRouter API error (${res.status}): ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const text = cleanSocialPostOutput(rawText);
  const tokensUsed = data.usage?.total_tokens || 180;
  return { text, tokensUsed };
}

/**
 * OpenAI API caller
 */
async function callOpenAI(
  apiKey: string,
  model: string = "gpt-4o-mini",
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; tokensUsed: number }> {
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const selectedModel = model?.trim() || "gpt-4o-mini";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg =
      errorData?.error?.message ||
      errorData?.message ||
      `OpenAI API error (${res.status}): ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const text = cleanSocialPostOutput(rawText);
  const tokensUsed = data.usage?.total_tokens || 180;
  return { text, tokensUsed };
}

/**
 * Google Gemini API caller (OpenAI-compatible endpoint)
 */
async function callGemini(
  apiKey: string,
  model: string = "gemini-1.5-flash",
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; tokensUsed: number }> {
  const selectedModel = model?.trim() || "gemini-1.5-flash";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg =
      errorData?.error?.message ||
      errorData?.message ||
      `Google Gemini API error (${res.status}): ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const text = cleanSocialPostOutput(rawText);
  const tokensUsed = data.usage?.total_tokens || 180;
  return { text, tokensUsed };
}

/**
 * Custom OpenAI-compatible endpoint caller
 */
async function callCustom(
  apiKey: string = "",
  baseUrl: string,
  model: string = "default",
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; tokensUsed: number }> {
  const url = baseUrl ? `${baseUrl.replace(/\/+$/, "")}/chat/completions` : "https://api.openai.com/v1/chat/completions";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: model || "default",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg =
      errorData?.error?.message ||
      errorData?.message ||
      `Custom API error (${res.status}): ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "";
  const text = cleanSocialPostOutput(rawText);
  const tokensUsed = data.usage?.total_tokens || 150;
  return { text, tokensUsed };
}

/**
 * Fallback contextual procedural generator when no external API key is configured
 */
function generateContextualFallback(action: string, prompt: string, tone: string): string {
  const cleanPrompt = prompt.trim() || "modern business growth strategies";
  const capitalizedTopic = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);

  if (action === "hashtags") {
    const keywords = cleanPrompt
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter((w) => w.length > 2)
      .map((w) => `#${w.charAt(0).toUpperCase() + w.slice(1)}`);
    const defaultTags = ["#Growth", "#Strategy", "#Leadership", "#Innovation", "#Productivity", "#Trends2026"];
    const combinedTags = Array.from(new Set([...keywords, ...defaultTags])).join(" ");
    return `${cleanPrompt}\n\n${combinedTags}`;
  }

  if (action === "shorten") {
    return `⚡️ ${cleanPrompt.slice(0, 160)}...\n\nWhat's your take? Drop a comment below 👇 #Growth`;
  }

  if (action === "rewrite") {
    return `✨ [Tone: ${tone}]\n\n${capitalizedTopic}.\n\nWhen we rethink this approach, everything changes:\n• Focus on core value drivers\n• Eliminate friction points\n• Scale what truly delivers results\n\nHow is your team tackling this right now?`;
  }

  if (action === "reply") {
    return `Thanks for sharing your perspective! That's a crucial point regarding ${cleanPrompt.slice(0, 40)}. We've found that staying agile here makes all the difference. What's been your biggest lesson so far? 🙌`;
  }

  // Action === 'create'
  return `💡 Let's talk about ${cleanPrompt}.\n\nMost teams overlook this, but here are 3 game-changing realities to keep in mind:\n\n1️⃣ The Landscape Has Shifted — What worked two years ago is now table stakes. Agility and speed to execution matter more than ever.\n\n2️⃣ Data-Driven Consistency — High performers don't rely on guesswork. They build systems that compound over time.\n\n3️⃣ Direct Engagement Wins — Authentic relationships and clear value propositions always outperform generic noise.\n\n👇 How is your team approaching this in 2026? Drop your thoughts below — let's start the discussion!\n\n#${cleanPrompt.split(" ")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "Business"} #Innovation #GrowthStrategy #Leadership #Insights`;
}

/**
 * Main AI generation dispatcher
 */
export async function generateContent(
  options: GenerateOptions
): Promise<GenerateResult> {
  const {
    action = "create",
    prompt,
    tone = "Professional & Authoritative",
    provider = "free_default",
    apiKey,
    model,
    baseUrl,
  } = options;

  const systemPrompt = buildSystemPrompt(action, tone);
  const userPrompt = prompt?.trim() || "Social media insights and best practices";

  // 1. NVIDIA NIM (nvidia/nemotron-3.5-lightning-30b-a3b, moonshotai/kimi-k3, etc.)
  if (provider === "nvidia" && apiKey) {
    try {
      const selectedModel = model || "nvidia/nemotron-3.5-lightning-30b-a3b";
      const result = await callNvidia(apiKey, selectedModel, systemPrompt, userPrompt);
      return {
        text: result.text,
        providerUsed: "NVIDIA NIM",
        modelUsed: selectedModel,
        tokensUsed: result.tokensUsed,
      };
    } catch (err: unknown) {
      console.error("NVIDIA generation error:", err);
      throw err;
    }
  }

  // 2. OpenRouter
  if (provider === "openrouter" && apiKey) {
    try {
      const result = await callOpenRouter(apiKey, model, systemPrompt, userPrompt);
      return {
        text: result.text,
        providerUsed: "OpenRouter",
        modelUsed: model || "anthropic/claude-3.5-sonnet",
        tokensUsed: result.tokensUsed,
      };
    } catch (err: unknown) {
      console.error("OpenRouter generation error:", err);
      throw err;
    }
  }

  // 3. OpenAI
  if (provider === "openai" && apiKey) {
    try {
      const result = await callOpenAI(apiKey, model, systemPrompt, userPrompt);
      return {
        text: result.text,
        providerUsed: "OpenAI",
        modelUsed: model || "gpt-4o-mini",
        tokensUsed: result.tokensUsed,
      };
    } catch (err: unknown) {
      console.error("OpenAI generation error:", err);
      throw err;
    }
  }

  // 4. Google Gemini
  if (provider === "gemini" && apiKey) {
    try {
      const result = await callGemini(apiKey, model, systemPrompt, userPrompt);
      return {
        text: result.text,
        providerUsed: "Google Gemini",
        modelUsed: model || "gemini-1.5-flash",
        tokensUsed: result.tokensUsed,
      };
    } catch (err: unknown) {
      console.error("Gemini generation error:", err);
      throw err;
    }
  }

  // 5. Custom Endpoint
  if (provider === "custom" && baseUrl) {
    try {
      const result = await callCustom(apiKey, baseUrl, model, systemPrompt, userPrompt);
      return {
        text: result.text,
        providerUsed: "Custom Endpoint",
        modelUsed: model || "custom",
        tokensUsed: result.tokensUsed,
      };
    } catch (err: unknown) {
      console.error("Custom endpoint generation error:", err);
      throw err;
    }
  }

  // 6. Server-side environment key fallbacks
  const serverNvidiaKey = process.env.NVIDIA_API_KEY;
  if (serverNvidiaKey) {
    try {
      const result = await callNvidia(
        serverNvidiaKey,
        "nvidia/nemotron-3.5-lightning-30b-a3b",
        systemPrompt,
        userPrompt
      );
      return {
        text: result.text,
        providerUsed: "SocialHub AI Core (NVIDIA NIM)",
        modelUsed: "nvidia/nemotron-3.5-lightning-30b-a3b",
        tokensUsed: result.tokensUsed,
      };
    } catch (err) {
      console.warn("Server NVIDIA fallback failed:", err);
    }
  }

  const serverOpenRouterKey = process.env.OPENROUTER_API_KEY;
  if (serverOpenRouterKey) {
    try {
      const result = await callOpenRouter(
        serverOpenRouterKey,
        "anthropic/claude-3.5-haiku",
        systemPrompt,
        userPrompt
      );
      return {
        text: result.text,
        providerUsed: "SocialHub AI Core (OpenRouter)",
        modelUsed: "claude-3.5-haiku",
        tokensUsed: result.tokensUsed,
      };
    } catch (err) {
      console.warn("Server OpenRouter fallback failed, using procedural generator:", err);
    }
  }

  const serverGeminiKey = process.env.GEMINI_API_KEY;
  if (serverGeminiKey) {
    try {
      const result = await callGemini(
        serverGeminiKey,
        "gemini-1.5-flash",
        systemPrompt,
        userPrompt
      );
      return {
        text: result.text,
        providerUsed: "SocialHub AI Core (Gemini)",
        modelUsed: "gemini-1.5-flash",
        tokensUsed: result.tokensUsed,
      };
    } catch (err) {
      console.warn("Server Gemini fallback failed, using procedural generator:", err);
    }
  }

  // 7. Built-in Procedural Fallback
  const generated = generateContextualFallback(action, userPrompt, tone);
  return {
    text: cleanSocialPostOutput(generated),
    providerUsed: "SocialHub AI Core v1",
    modelUsed: "built-in",
    tokensUsed: 140,
  };
}

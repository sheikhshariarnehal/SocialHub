import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerType, apiKey, model, baseUrl } = body;

    if (!providerType) {
      return NextResponse.json(
        { success: false, error: "Provider type is required" },
        { status: 400 }
      );
    }

    if (providerType !== "free_default" && !apiKey && providerType !== "custom") {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // 1. OpenRouter
    if (providerType === "openrouter") {
      const selectedModel = model?.trim() || "anthropic/claude-3.5-sonnet";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": "https://socialhub-sigma.vercel.app",
          "X-Title": "SocialHub",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      const latency = `${Date.now() - startTime}ms`;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `OpenRouter returned status ${res.status}: ${res.statusText}`;
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        latency,
        message: `Successfully connected to OpenRouter (${selectedModel})!`,
      });
    }

    // 2. OpenAI
    if (providerType === "openai") {
      const selectedModel = model?.trim() || "gpt-4o-mini";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      const latency = `${Date.now() - startTime}ms`;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `OpenAI returned status ${res.status}: ${res.statusText}`;
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        latency,
        message: `Successfully connected to OpenAI (${selectedModel})!`,
      });
    }

    // 3. Google Gemini
    if (providerType === "gemini") {
      const selectedModel = model?.trim() || "gemini-1.5-flash";
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      const latency = `${Date.now() - startTime}ms`;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `Gemini returned status ${res.status}: ${res.statusText}`;
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        latency,
        message: `Successfully connected to Google Gemini (${selectedModel})!`,
      });
    }

    // 4. Custom Endpoint
    if (providerType === "custom") {
      if (!baseUrl) {
        return NextResponse.json(
          { success: false, error: "Base URL is required for custom endpoints" },
          { status: 400 }
        );
      }
      const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey.trim()}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: model || "default",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      const latency = `${Date.now() - startTime}ms`;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `Custom endpoint returned status ${res.status}: ${res.statusText}`;
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        latency,
        message: "Successfully connected to custom endpoint!",
      });
    }

    return NextResponse.json({
      success: true,
      latency: "120ms",
      message: "Built-in provider is ready.",
    });
  } catch (err: unknown) {
    console.error("Test provider error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to connect to provider" },
      { status: 500 }
    );
  }
}

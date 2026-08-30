import { NextResponse, type NextRequest } from "next/server";
import { generateContent } from "@/lib/ai/provider-router";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, tone, provider, apiKey, model, baseUrl } = body;

    if (!prompt && !action) {
      return NextResponse.json({ error: "Missing prompt or action" }, { status: 400 });
    }

    const result = await generateContent({
      action: action || "create",
      prompt: prompt || "",
      tone,
      provider,
      apiKey,
      model,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      generatedText: result.text,
      providerUsed: result.providerUsed,
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed,
    });
  } catch (err: unknown) {
    console.error("AI Generation route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

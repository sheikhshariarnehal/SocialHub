import { NextResponse, type NextRequest } from "next/server";

export interface OpenRouterModelResponse {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const onlyFree = searchParams.get("free") === "true";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models from OpenRouter" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const allModels: OpenRouterModelResponse[] = data.data || [];

    // Filter free models (either ending in :free or pricing is 0)
    const freeModels = allModels.filter((m) => {
      const isFreeId = m.id.endsWith(":free");
      const isFreePricing =
        parseFloat(m.pricing?.prompt || "1") === 0 &&
        parseFloat(m.pricing?.completion || "1") === 0;
      return isFreeId || isFreePricing;
    });

    return NextResponse.json({
      success: true,
      models: onlyFree ? freeModels : allModels,
      freeModelsCount: freeModels.length,
      totalCount: allModels.length,
    });
  } catch (err: unknown) {
    console.error("Failed to load OpenRouter models:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error fetching models" },
      { status: 500 }
    );
  }
}

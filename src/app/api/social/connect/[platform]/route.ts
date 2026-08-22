import { NextResponse, type NextRequest } from "next/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType } from "@/lib/database.types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await context.params;
    const requestUrl = new URL(request.url);
    const workspaceId = requestUrl.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.redirect(
        new URL("/settings/accounts?error=Missing+workspaceId", request.url)
      );
    }

    const redirectUri = `${requestUrl.origin}/api/social/callback/${platform.toLowerCase()}`;
    const state = JSON.stringify({ workspaceId, timestamp: Date.now() });

    const adapter = getPlatformAdapter(platform.toLowerCase() as PlatformType);
    const authUrl = adapter.getAuthorizationUrl(state, redirectUri);

    // Ensure redirect target is always an absolute URL to comply with Next.js router rules
    const absoluteTarget = authUrl.startsWith("http://") || authUrl.startsWith("https://")
      ? authUrl
      : new URL(authUrl, request.url).toString();

    return NextResponse.redirect(absoluteTarget);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate authorization URL";
    console.error("Connect route error:", err);
    return NextResponse.redirect(
      new URL(`/settings/accounts?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType } from "@/lib/database.types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const requestUrl = new URL(request.url);
  const workspaceId = requestUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const redirectUri = `${requestUrl.origin}/api/social/callback/${platform}`;
  const state = JSON.stringify({ workspaceId, timestamp: Date.now() });

  const adapter = getPlatformAdapter(platform as PlatformType);
  const authUrl = adapter.getAuthorizationUrl(state, redirectUri);

  return NextResponse.redirect(authUrl);
}

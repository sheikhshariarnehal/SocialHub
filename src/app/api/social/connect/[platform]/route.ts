import { NextResponse, type NextRequest } from "next/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType } from "@/lib/database.types";
import crypto from "crypto";

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

    const platformKey = platform.toLowerCase() as PlatformType;
    const redirectUri = `${requestUrl.origin}/api/social/callback/${platformKey}`;

    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (platformKey === "twitter") {
      codeVerifier = crypto.randomBytes(32).toString("base64url");
      codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    }

    const stateObj = {
      workspaceId,
      codeVerifier,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

    const adapter = getPlatformAdapter(platformKey);
    const authUrl = adapter.getAuthorizationUrl(state, redirectUri, codeChallenge);

    // Ensure redirect target is always an absolute URL to comply with Next.js router rules
    const absoluteTarget =
      authUrl.startsWith("http://") || authUrl.startsWith("https://")
        ? authUrl
        : new URL(authUrl, request.url).toString();

    const response = NextResponse.redirect(absoluteTarget);

    if (codeVerifier) {
      response.cookies.set("twitter_oauth_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate authorization URL";
    console.error("Connect route error:", err);
    return NextResponse.redirect(
      new URL(`/settings/accounts?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

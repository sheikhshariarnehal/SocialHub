import { NextResponse, type NextRequest } from "next/server";
import { connectAccount } from "@/lib/actions/social-accounts";
import type { PlatformType } from "@/lib/database.types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const stateStr = requestUrl.searchParams.get("state");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDesc = requestUrl.searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=${encodeURIComponent(errorDesc || errorParam)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=${encodeURIComponent("No authorization code returned from provider")}`,
        request.url
      )
    );
  }

  let workspaceId = "default";
  let codeVerifier: string | undefined = request.cookies.get("twitter_oauth_verifier")?.value;

  if (stateStr) {
    try {
      let decoded = stateStr;
      try {
        const candidate = Buffer.from(stateStr, "base64url").toString("utf-8");
        if (candidate.startsWith("{")) {
          decoded = candidate;
        }
      } catch {
        // use raw stateStr
      }
      const state = JSON.parse(decoded);
      if (state.workspaceId) workspaceId = state.workspaceId;
      if (state.codeVerifier) codeVerifier = state.codeVerifier;
    } catch {
      // ignore
    }
  }

  const platformKey = platform.toLowerCase() as PlatformType;
  const redirectUri = `${requestUrl.origin}/api/social/callback/${platformKey}`;

  const res = await connectAccount(
    workspaceId,
    platformKey,
    code,
    redirectUri,
    codeVerifier
  );

  if (res.error) {
    return NextResponse.redirect(
      new URL(`/settings/accounts?error=${encodeURIComponent(res.error)}`, request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL(`/settings/accounts?success=${platformKey}`, request.url)
  );

  if (request.cookies.has("twitter_oauth_verifier")) {
    response.cookies.delete("twitter_oauth_verifier");
  }

  return response;
}

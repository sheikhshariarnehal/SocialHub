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
  if (stateStr) {
    try {
      const state = JSON.parse(stateStr);
      workspaceId = state.workspaceId;
    } catch {
      // ignore
    }
  }

  const redirectUri = `${requestUrl.origin}/api/social/callback/${platform}`;

  const res = await connectAccount(
    workspaceId,
    platform as PlatformType,
    code,
    redirectUri
  );

  if (res.error) {
    return NextResponse.redirect(
      new URL(`/settings/accounts?error=${encodeURIComponent(res.error)}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/settings/accounts?success=${platform}`, request.url)
  );
}

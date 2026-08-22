"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType, SocialAccount } from "@/lib/database.types";

export async function getWorkspaceAccounts(
  workspaceId: string
): Promise<SocialAccount[]> {
  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);

  let targetId = workspaceId;
  if (!isUuid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: member } = await (supabase
        .from("workspace_members") as any)
        .select("workspace_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (member?.workspace_id) {
        targetId = member.workspace_id;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from("social_accounts") as any)
    .select("*")
    .eq("workspace_id", targetId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as SocialAccount[];
}

export async function connectAccount(
  workspaceId: string,
  platform: PlatformType,
  code: string,
  redirectUri: string
) {
  const supabase = await createClient();
  const adapter = getPlatformAdapter(platform);

  // 1. Exchange code for tokens
  const tokens = await adapter.exchangeCodeForTokens(code, redirectUri);
  // 2. Fetch profile from platform
  const profile = await adapter.getProfile(tokens.accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Resolve target workspace UUID
  let targetWorkspaceId = workspaceId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetWorkspaceId);

  if (!isUuid && user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: member } = await (supabase
      .from("workspace_members") as any)
      .select("workspace_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (member?.workspace_id) {
      targetWorkspaceId = member.workspace_id;
    }
  }

  // 3. Upsert social_account record with live access_token and refresh_token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from("social_accounts") as any)
    .upsert(
      {
        workspace_id: targetWorkspaceId,
        platform,
        external_account_id: profile.id,
        display_name: profile.displayName || profile.handle,
        avatar_url: profile.avatarUrl,
        status: "connected",
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.tokenExpiresAt
          ? tokens.tokenExpiresAt.toISOString()
          : null,
        connected_by: user?.id || null,
      },
      { onConflict: "workspace_id,platform,external_account_id" }
    )
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/accounts");
  revalidatePath("/dashboard");
  return { success: true, account: data };
}

export async function disconnectAccount(accountId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("id", accountId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

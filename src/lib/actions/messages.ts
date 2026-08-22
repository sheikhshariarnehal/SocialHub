"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { Message, PlatformType } from "@/lib/database.types";

export async function getWorkspaceMessages(
  workspaceId: string
): Promise<Message[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("messages") as any)
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("received_at", { ascending: false });

  if (error || !data) return [];
  return data as Message[];
}

export async function replyToMessage(
  messageId: string,
  replyText: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch message details
  const { data: message, error: msgError } = await (supabase
    .from("messages") as any)
    .select(`
      *,
      social_accounts (
        id,
        platform
      )
    `)
    .eq("id", messageId)
    .single();

  if (msgError || !message) {
    return { error: msgError?.message || "Message not found" };
  }

  // 2. Publish reply via platform adapter
  const platform = message.social_accounts?.platform as PlatformType;
  if (platform) {
    const adapter = getPlatformAdapter(platform);
    await adapter.replyToComment("dummy_token", message.external_id, replyText);
  }

  // 3. Mark original message as replied
  await (supabase
    .from("messages") as any)
    .update({
      status: "replied",
      handled_by: user?.id || null,
    })
    .eq("id", messageId);

  // 4. Create outbound message record
  await (supabase.from("messages") as any).insert({
    workspace_id: message.workspace_id,
    social_account_id: message.social_account_id,
    post_target_id: message.post_target_id,
    type: message.type,
    direction: "outbound",
    external_id: `reply_${Date.now()}`,
    parent_external_id: message.external_id,
    author_name: "SocialHub User",
    content: replyText,
    status: "read",
    handled_by: user?.id || null,
  });

  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateMessageStatus(
  messageId: string,
  status: "read" | "unread" | "archived"
) {
  const supabase = await createClient();
  const { error } = await (supabase
    .from("messages") as any)
    .update({ status })
    .eq("id", messageId);

  if (error) return { error: error.message };

  revalidatePath("/inbox");
  return { success: true };
}

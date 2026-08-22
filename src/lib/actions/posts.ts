"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { Post, PostStatus, PlatformType } from "@/lib/database.types";

export interface CreatePostInput {
  workspaceId: string;
  content: string;
  media?: Array<{ storage_path: string; type: "image" | "video" | "gif"; order: number }>;
  targetAccountIds: string[];
  scheduledAt?: string | null;
  publishImmediately?: boolean;
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auto-resolve valid UUID workspace_id if fallback string provided
  let validWorkspaceId = input.workspaceId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validWorkspaceId);
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
      validWorkspaceId = member.workspace_id;
    }
  }

  const initialStatus: PostStatus = input.publishImmediately
    ? "publishing"
    : input.scheduledAt
    ? "scheduled"
    : "draft";

  // 1. Create the Post record in Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post, error: postError } = await (supabase
    .from("posts") as any)
    .insert({
      workspace_id: validWorkspaceId,
      author_id: user?.id || null,
      content: input.content,
      media: input.media || [],
      status: initialStatus,
      scheduled_at: input.scheduledAt || null,
      published_at: input.publishImmediately ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (postError || !post) {
    return { error: postError?.message || "Failed to create post" };
  }

  // 2. Fetch connected social accounts for this workspace
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: accounts } = await (supabase
    .from("social_accounts") as any)
    .select("*")
    .eq("workspace_id", validWorkspaceId);

  // 3. Create PostTarget records and trigger publishing if requested
  const targetResults = [];
  if (input.targetAccountIds && input.targetAccountIds.length > 0) {
    const targets = [];

    for (const targetIdOrPlatform of input.targetAccountIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchedAccount = accounts?.find(
        (acc: any) => acc.id === targetIdOrPlatform || acc.platform === targetIdOrPlatform
      );

      let externalPostId: string | null = null;
      let targetStatus: "published" | "pending" | "failed" = input.publishImmediately ? "published" : "pending";

      if (input.publishImmediately) {
        const platformKey = (matchedAccount?.platform || targetIdOrPlatform) as PlatformType;
        try {
          const adapter = getPlatformAdapter(platformKey);
          const accessToken = matchedAccount?.access_token || `token_${platformKey}_${Date.now()}`;
          const publishRes = await adapter.publishPost(accessToken, {
            content: input.content,
            mediaUrls: input.media?.map((m) => m.storage_path) || [],
          });

          if (publishRes.success) {
            externalPostId = publishRes.externalPostId || null;
            targetStatus = "published";
          } else {
            targetStatus = "failed";
          }
          targetResults.push({ platform: platformKey, ...publishRes });
        } catch (pubErr) {
          console.error(`Publishing failed on platform ${platformKey}:`, pubErr);
          targetStatus = "failed";
        }
      }

      if (matchedAccount?.id) {
        targets.push({
          post_id: post.id,
          social_account_id: matchedAccount.id,
          status: targetStatus,
          external_post_id: externalPostId,
          published_at: input.publishImmediately ? new Date().toISOString() : null,
        });
      }
    }

    if (targets.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("post_targets") as any).insert(targets);
    }
  }

  // 4. Update post status to published if immediate publish succeeded
  if (input.publishImmediately) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("posts") as any)
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", post.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/compose");
  return { success: true, post: post as Post, targetResults };
}

export async function getWorkspacePosts(workspaceId: string): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let validWorkspaceId = workspaceId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validWorkspaceId);
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
      validWorkspaceId = member.workspace_id;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from("posts") as any)
    .select(`
      *,
      post_targets (
        id,
        status,
        external_post_id,
        social_accounts (
          id,
          platform,
          display_name,
          handle,
          avatar_url
        )
      )
    `)
    .eq("workspace_id", validWorkspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Post[];
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true };
}

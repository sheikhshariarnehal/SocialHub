"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Post, PostStatus } from "@/lib/database.types";

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

  const status: PostStatus = input.publishImmediately
    ? "publishing"
    : input.scheduledAt
    ? "scheduled"
    : "draft";

  // 1. Create the Post record
  const { data: post, error: postError } = await (supabase
    .from("posts") as any)
    .insert({
      workspace_id: input.workspaceId,
      author_id: user?.id || null,
      content: input.content,
      media: input.media || [],
      status,
      scheduled_at: input.scheduledAt || null,
      published_at: input.publishImmediately ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (postError || !post) {
    return { error: postError?.message || "Failed to create post" };
  }

  // 2. Create PostTarget records for each selected account
  if (input.targetAccountIds && input.targetAccountIds.length > 0) {
    const targets = input.targetAccountIds.map((accId) => ({
      post_id: post.id,
      social_account_id: accId,
      status: input.publishImmediately ? ("published" as const) : ("pending" as const),
      published_at: input.publishImmediately ? new Date().toISOString() : null,
    }));

    await (supabase.from("post_targets") as any).insert(targets);
  }

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/compose");
  return { success: true, post: post as Post };
}

export async function getWorkspacePosts(workspaceId: string): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("posts") as any)
    .select("*")
    .eq("workspace_id", workspaceId)
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

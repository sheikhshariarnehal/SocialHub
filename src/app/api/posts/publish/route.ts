import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType } from "@/lib/database.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch post and its target social accounts
    const { data: post, error: postError } = await (supabase
      .from("posts") as any)
      .select(`
        *,
        post_targets (
          id,
          social_account_id,
          social_accounts (
            id,
            platform
          )
        )
      `)
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message || "Post not found" },
        { status: 404 }
      );
    }

    // Publish to each target platform
    const results = [];
    for (const target of post.post_targets || []) {
      const platform = target.social_accounts?.platform as PlatformType;
      if (platform) {
        const adapter = getPlatformAdapter(platform);
        const publishRes = await adapter.publishPost("dummy_token", {
          content: post.content,
          mediaUrls: (post.media as Array<{ storage_path: string }>).map(
            (m) => m.storage_path
          ),
        });

        // Update post_target status
        await (supabase
          .from("post_targets") as any)
          .update({
            status: publishRes.success ? "published" : "failed",
            external_post_id: publishRes.externalPostId || null,
            published_at: new Date().toISOString(),
          })
          .eq("id", target.id);

        results.push({ platform, ...publishRes });
      }
    }

    // Update main post status
    await (supabase
      .from("posts") as any)
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", postId);

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 500 }
    );
  }
}

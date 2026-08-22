import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlatformAdapter } from "@/lib/platforms";
import type { PlatformType } from "@/lib/database.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch active accounts for workspace
    const { data: accounts } = await (supabase
      .from("social_accounts") as any)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "connected");

    let syncedCount = 0;
    for (const acc of accounts || []) {
      const adapter = getPlatformAdapter(acc.platform as PlatformType);
      const comments = await adapter.fetchComments("dummy_token");

      for (const comment of comments) {
        await (supabase.from("messages") as any).upsert(
          {
            workspace_id: workspaceId,
            social_account_id: acc.id,
            type: "comment",
            direction: "inbound",
            external_id: comment.id,
            author_name: comment.authorName,
            content: comment.content,
            sentiment: comment.sentiment || "neutral",
            status: "unread",
            received_at: comment.timestamp,
          },
          { onConflict: "social_account_id,external_id" }
        );
        syncedCount++;
      }
    }

    return NextResponse.json({ success: true, syncedCount });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}

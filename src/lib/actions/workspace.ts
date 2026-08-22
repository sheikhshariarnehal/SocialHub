"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceMember } from "@/lib/database.types";

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceMember["role"];
}

export type CreateWorkspaceResult =
  | { success: true; workspace: Workspace; error?: never }
  | { error: string; success?: never; workspace?: never };

/**
 * Creates a new workspace and initializes owner membership + free subscription
 */
export async function createWorkspace(formData: FormData): Promise<CreateWorkspaceResult> {
  const name = formData.get("name") as string;
  let slug = formData.get("slug") as string;

  if (!name) {
    return { error: "Workspace name is required" };
  }

  if (!slug) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a workspace" };
  }

  // 1. Create Workspace
  const { data: workspace, error: wsError } = await (supabase
    .from("workspaces") as any)
    .insert({
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      owner_id: user.id,
    })
    .select()
    .single();

  if (wsError || !workspace) {
    return { error: wsError?.message || "Failed to create workspace" };
  }

  // 2. Create Owner Member Record
  const { error: memberError } = await (supabase
    .from("workspace_members") as any)
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("Failed to add owner to members:", memberError);
  }

  // 3. Initialize Free Tier Subscription
  await (supabase.from("subscriptions") as any).insert({
    workspace_id: workspace.id,
    tier: "free",
    status: "active",
    ai_generation_quota: 20,
    ai_generations_used: 0,
    connected_accounts_limit: 2,
    scheduled_posts_limit: 30,
  });

  revalidatePath("/", "layout");
  return { success: true, workspace };
}

/**
 * Fetches all workspaces the current user belongs to (and auto-provisions a personal one if none exist)
 */
export async function getUserWorkspaces(): Promise<WorkspaceWithRole[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return fallback personal workspace for dev / unauthenticated preview
    return [
      {
        id: "default_workspace",
        name: "Personal Workspace",
        slug: "personal-workspace",
        owner_id: "demo-user",
        role: "owner",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      role,
      workspaces (
        id,
        name,
        slug,
        owner_id,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id);

  if (error || !data || data.length === 0) {
    // User exists in auth but doesn't have a workspace in DB yet -> auto-provision
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Personal";
    const slug = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${user.id.slice(0, 6)}`;

    const { data: newWs } = await (supabase
      .from("workspaces") as any)
      .insert({
        name: `${displayName}'s Workspace`,
        slug,
        owner_id: user.id,
      })
      .select()
      .single();

    if (newWs) {
      await (supabase.from("workspace_members") as any).insert({
        workspace_id: newWs.id,
        user_id: user.id,
        role: "owner",
      });

      await (supabase.from("subscriptions") as any).insert({
        workspace_id: newWs.id,
        tier: "free",
        status: "active",
        ai_generation_quota: 20,
        ai_generations_used: 0,
        connected_accounts_limit: 2,
        scheduled_posts_limit: 30,
      });

      return [{ ...newWs, role: "owner" }];
    }

    return [
      {
        id: "default_workspace",
        name: `${displayName}'s Workspace`,
        slug: "personal-workspace",
        owner_id: user.id,
        role: "owner",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: any) => item.workspaces)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      ...item.workspaces,
      role: item.role,
    }));
}

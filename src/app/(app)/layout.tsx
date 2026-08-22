import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import { WorkspaceInitializer } from "@/components/workspace-initializer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If unauthenticated in production, redirect to login
  if (!user && process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sync server-fetched workspaces with client state */}
      <WorkspaceInitializer initialWorkspaces={workspaces} />

      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

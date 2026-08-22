"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/hooks/use-workspace";
import type { WorkspaceWithRole } from "@/lib/actions/workspace";

export function WorkspaceInitializer({
  initialWorkspaces,
}: {
  initialWorkspaces: WorkspaceWithRole[];
}) {
  const { setWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    if (initialWorkspaces && initialWorkspaces.length > 0) {
      setWorkspaces(initialWorkspaces);
    }
  }, [initialWorkspaces, setWorkspaces]);

  return null;
}

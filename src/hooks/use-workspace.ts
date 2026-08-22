"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceWithRole } from "@/lib/actions/workspace";

const DEFAULT_WORKSPACE: WorkspaceWithRole = {
  id: "default_workspace",
  name: "Personal Workspace",
  slug: "personal-workspace",
  owner_id: "default_owner",
  role: "owner",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface WorkspaceState {
  workspaces: WorkspaceWithRole[];
  currentWorkspace: WorkspaceWithRole;
  isLoading: boolean;
  setWorkspaces: (workspaces: WorkspaceWithRole[]) => void;
  setCurrentWorkspace: (workspace: WorkspaceWithRole) => void;
  setLoading: (loading: boolean) => void;
  switchWorkspace: (workspaceId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [DEFAULT_WORKSPACE],
      currentWorkspace: DEFAULT_WORKSPACE,
      isLoading: false,
      setWorkspaces: (workspaces) => {
        if (!workspaces || workspaces.length === 0) return;
        const current = get().currentWorkspace;
        const exists = current && workspaces.some((w) => w.id === current.id);
        set({
          workspaces,
          currentWorkspace: exists ? current : workspaces[0],
          isLoading: false,
        });
      },
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setLoading: (isLoading) => set({ isLoading }),
      switchWorkspace: (workspaceId) => {
        const found = get().workspaces.find((w) => w.id === workspaceId);
        if (found) {
          set({ currentWorkspace: found });
        }
      },
    }),
    {
      name: "socialhub-workspace-storage",
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }),
    }
  )
);

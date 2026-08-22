"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Sparkles, Building2 } from "lucide-react";
import { useWorkspaceStore } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/lib/actions/workspace";
import { toast } from "sonner";

export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { workspaces, currentWorkspace, switchWorkspace, setCurrentWorkspace } =
    useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.set("name", newWsName.trim());
      const res = await createWorkspace(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.workspace) {
        setCurrentWorkspace({
          ...res.workspace,
          role: "owner",
        });
        toast.success(`Created workspace "${newWsName}"`);
        setShowCreateModal(false);
        setNewWsName("");
        router.refresh();
      }
    } catch {
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const displayName = currentWorkspace?.name || "My Workspace";

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2 text-left transition-all hover:bg-sidebar-accent hover:border-sidebar-border/80 ${
            collapsed ? "justify-center p-2" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-sidebar-foreground">
                  {displayName}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {currentWorkspace?.role || "Owner"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {workspaces.length > 0 ? (
                  workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        switchWorkspace(ws.id);
                        setIsOpen(false);
                        router.refresh();
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {currentWorkspace?.id === ws.id && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground bg-accent"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{displayName}</span>
                    </div>
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  </button>
                )}
              </div>

              <div className="my-1 border-t border-border/60" />

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create new workspace</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to manage a different brand, client, or team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="createWsName">Workspace Name</Label>
            <Input
              id="createWsName"
              placeholder="e.g. Agency Client B"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" isLoading={isCreating}>
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}

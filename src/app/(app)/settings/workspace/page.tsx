"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  Shield,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceStore } from "@/hooks/use-workspace";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

const INITIAL_MEMBERS: MemberItem[] = [
  { id: "m-1", name: "Alex Smith", email: "alex@example.com", role: "owner" },
  { id: "m-2", name: "Sarah Chen", email: "sarah@acmedesign.com", role: "admin" },
  { id: "m-3", name: "David Kim", email: "david@acmedesign.com", role: "editor" },
];

export default function WorkspaceSettingsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [name, setName] = useState(currentWorkspace?.name || "Acme Marketing");
  const [slug, setSlug] = useState(currentWorkspace?.slug || "acme-marketing");
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Workspace details updated!");
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
      },
    ]);

    toast.success(`Invitation sent to ${inviteEmail}!`);
    setInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Member removed from workspace");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure general workspace parameters, team roster, and permissions.
        </p>
      </div>

      {/* General Info */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            General Information
          </CardTitle>
          <CardDescription>
            Identify and brand your workspace across the platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveGeneral}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wsNameInput">Workspace Display Name</Label>
              <Input
                id="wsNameInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wsSlugInput">Workspace URL Slug</Label>
              <Input
                id="wsSlugInput"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/40 py-4">
            <Button type="submit" variant="brand" size="sm">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Team & Members */}
      <Card glass>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              Control access levels and manage workspace collaborators
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/40"
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.name} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={member.role === "owner" ? "brand" : "secondary"}
                  className="capitalize text-[10px]"
                >
                  {member.role}
                </Badge>
                {member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete this workspace and all associated scheduled posts, tokens, and records.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center py-4 border-t border-destructive/20">
          <span className="text-xs text-muted-foreground">
            This action is irreversible.
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toast.error("Workspace deletion disabled in demo environment.")}
          >
            Delete Workspace
          </Button>
        </CardFooter>
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <form onSubmit={handleInvite}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Collaborate on scheduled posts, reviews, and inbox replies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invEmail">Email Address</Label>
              <Input
                id="invEmail"
                type="email"
                placeholder="colleague@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invRole">Workspace Role</Label>
              <select
                id="invRole"
                value={inviteRole}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-input bg-card/60 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="admin">Admin (Full management + accounts)</option>
                <option value="editor">Editor (Compose, schedule, and reply)</option>
                <option value="viewer">Viewer (Read-only analytics and posts)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand">
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

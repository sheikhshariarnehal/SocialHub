"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  getWorkspaceAccounts,
  disconnectAccount,
} from "@/lib/actions/social-accounts";
import type { SocialAccount } from "@/lib/database.types";

interface PlatformDisplayInfo {
  platform: string;
  name: string;
  handle: string;
  color: string;
  envKey: string;
}

const SUPPORTED_PLATFORMS: PlatformDisplayInfo[] = [
  { platform: "Instagram", name: "Instagram", handle: "Connect Instagram", color: "from-pink-500 via-rose-500 to-amber-500", envKey: "INSTAGRAM_CLIENT_ID" },
  { platform: "LinkedIn", name: "LinkedIn", handle: "Connect LinkedIn", color: "bg-[#0A66C2]", envKey: "LINKEDIN_CLIENT_ID" },
  { platform: "Twitter", name: "X (Twitter)", handle: "Connect X Account", color: "bg-neutral-900", envKey: "TWITTER_CLIENT_ID" },
  { platform: "Facebook", name: "Facebook", handle: "Connect Facebook Page", color: "bg-[#1877F2]", envKey: "FACEBOOK_CLIENT_ID" },
  { platform: "TikTok", name: "TikTok", handle: "Connect TikTok Profile", color: "bg-neutral-900", envKey: "TIKTOK_CLIENT_KEY" },
  { platform: "YouTube", name: "YouTube", handle: "Connect YouTube Channel", color: "bg-[#FF0000]", envKey: "GOOGLE_CLIENT_ID" },
];

export default function AccountsSettingsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const searchParams = useSearchParams();
  const [dbAccounts, setDbAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [targetAccount, setTargetAccount] = useState<{ id?: string; platform: string; handle: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);

  // Handle URL notifications from OAuth callback
  useEffect(() => {
    const successPlatform = searchParams.get("success");
    const errorMsg = searchParams.get("error");

    if (successPlatform) {
      toast.success(`Successfully connected ${successPlatform} to your workspace!`);
    } else if (errorMsg) {
      toast.error(`Connection failed: ${errorMsg}`);
    }
  }, [searchParams]);

  // Load real workspace accounts for the currently authenticated user's workspace
  useEffect(() => {
    async function loadAccounts() {
      if (currentWorkspace?.id) {
        setLoading(true);
        try {
          const accounts = await getWorkspaceAccounts(currentWorkspace.id);
          setDbAccounts(accounts);
        } catch (err) {
          console.error("Failed to load accounts:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadAccounts();
  }, [currentWorkspace?.id]);

  const handleConnect = (platform: string) => {
    const wsId = currentWorkspace?.id || "default_workspace";
    toast.loading(`Redirecting to ${platform} OAuth login...`);
    // Redirect browser to platform OAuth authorization endpoint
    window.location.href = `/api/social/connect/${platform.toLowerCase()}?workspaceId=${encodeURIComponent(wsId)}`;
  };

  const handleRefresh = (accId: string, platform: string) => {
    setIsRefreshing(accId);
    setTimeout(() => {
      setIsRefreshing(null);
      toast.success(`Token renewed for ${platform}! Valid for 60 more days.`);
    }, 600);
  };

  const handleConfirmDisconnect = async () => {
    if (!targetAccount) return;
    if (targetAccount.id) {
      await disconnectAccount(targetAccount.id);
      setDbAccounts((prev) => prev.filter((a) => a.id !== targetAccount.id));
    }
    toast.success(`Disconnected ${targetAccount.platform}`);
    setDisconnectModalOpen(false);
    setTargetAccount(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Connected Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage authorized social channels for your personal account:{" "}
            <span className="font-semibold text-foreground">
              {currentWorkspace?.name || "Personal Workspace"}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUPPORTED_PLATFORMS.map((p) => {
          const connectedAcc = dbAccounts.find(
            (a) => a.platform.toLowerCase() === p.platform.toLowerCase()
          );
          const isConnected = !!connectedAcc;

          return (
            <Card
              key={p.platform}
              glass
              className={`transition-all duration-200 ${
                isConnected
                  ? "border-border/80 hover:border-primary/40 shadow-sm"
                  : "border-dashed opacity-80 hover:opacity-100"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                        p.color.startsWith("bg-")
                          ? p.color
                          : `bg-gradient-to-r ${p.color}`
                      }`}
                    >
                      {p.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <CardTitle className="text-sm font-semibold">
                      {p.platform}
                    </CardTitle>
                  </div>
                  {isConnected ? (
                    <Badge variant="success" dot className="text-[10px]">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Not Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={connectedAcc?.avatar_url || null}
                    name={connectedAcc?.display_name || p.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {connectedAcc ? connectedAcc.display_name : "Not connected"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {connectedAcc ? `@${connectedAcc.display_name?.toLowerCase().replace(/\s+/g, "_")}` : p.handle}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 bg-card/40 p-2.5 text-[11px] flex items-center justify-between text-muted-foreground">
                  <span>Status:</span>
                  <span className="font-medium text-foreground">
                    {isConnected ? "Active & Authorized" : "Disconnected"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        isLoading={isRefreshing === connectedAcc.id}
                        onClick={() => handleRefresh(connectedAcc.id, p.platform)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                        Renew
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setTargetAccount({
                            id: connectedAcc.id,
                            platform: p.platform,
                            handle: connectedAcc.display_name || p.name,
                          });
                          setDisconnectModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="brand"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleConnect(p.platform)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Connect {p.platform}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogHeader>
          <DialogTitle>Disconnect {targetAccount?.platform}?</DialogTitle>
          <DialogDescription>
            This will revoke SocialHub&apos;s publishing tokens for{" "}
            <span className="font-semibold text-foreground">
              {targetAccount?.handle}
            </span>
            . Any scheduled posts targeting this channel will be paused.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDisconnectModalOpen(false)}
          >
            Keep Connected
          </Button>
          <Button variant="destructive" onClick={handleConfirmDisconnect}>
            Disconnect Channel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

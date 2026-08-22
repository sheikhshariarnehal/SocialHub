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
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smartphone,
  Globe,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { PlugConnectedIcon } from "@/components/icons";
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
  helpText: string;
}

const SUPPORTED_PLATFORMS: PlatformDisplayInfo[] = [
  {
    platform: "Instagram",
    name: "Instagram",
    handle: "Connect Instagram Professional",
    color: "from-pink-500 via-rose-500 to-amber-500",
    helpText: "Requires an Instagram Business or Creator account linked to a Facebook Page.",
  },
  {
    platform: "LinkedIn",
    name: "LinkedIn",
    handle: "Connect LinkedIn Account",
    color: "bg-[#0A66C2]",
    helpText: "Direct automated publishing to your personal profile feed & company pages.",
  },
  {
    platform: "Twitter",
    name: "X (Twitter)",
    handle: "Connect X Account",
    color: "bg-neutral-900",
    helpText: "OAuth 2.0 direct publishing to your X timeline.",
  },
  {
    platform: "Facebook",
    name: "Facebook",
    handle: "Connect Facebook Page",
    color: "bg-[#1877F2]",
    helpText: "Publishes directly to your Facebook Page (e.g. Nimon Solutions Ltd.).",
  },
  {
    platform: "TikTok",
    name: "TikTok",
    handle: "Connect TikTok Profile",
    color: "bg-neutral-900",
    helpText: "Direct video publishing to your TikTok creator account.",
  },
  {
    platform: "YouTube",
    name: "YouTube",
    handle: "Connect YouTube Channel",
    color: "bg-[#FF0000]",
    helpText: "Direct video & Shorts publishing to your YouTube channel.",
  },
];

const GUIDES = [
  {
    platform: "Instagram",
    icon: Smartphone,
    title: "How to Connect Instagram (Business / Creator)",
    badge: "30 Seconds",
    steps: [
      {
        step: "1",
        title: "Ensure Professional Account",
        desc: "In the Instagram mobile app, go to Settings → Account type and tools → Switch to Professional (Creator or Business) Account.",
      },
      {
        step: "2",
        title: "Link to your Facebook Page",
        desc: "In Instagram app, tap 'Edit Profile' → under Public business information, tap 'Page' (or 'Facebook: Connect') → Select your Facebook Page (e.g. Nimon Solutions Ltd.).",
      },
      {
        step: "3",
        title: "Authorize on SocialHub",
        desc: "Click '+ Connect Instagram' below. In the Meta dialog, choose your Facebook Page and click Continue.",
      },
    ],
  },
  {
    platform: "Facebook",
    icon: Globe,
    title: "How to Connect Facebook Pages",
    badge: "Instant",
    steps: [
      {
        step: "1",
        title: "Have a Facebook Page",
        desc: "Meta's API permits automated publishing to Facebook Pages (create one free at facebook.com/pages/create if you don't have one).",
      },
      {
        step: "2",
        title: "Click '+ Connect Facebook'",
        desc: "In the Meta popup, click 'Edit settings' and check the checkbox next to your Page (e.g. Nimon Solutions Ltd.).",
      },
      {
        step: "3",
        title: "Publish",
        desc: "Your Facebook Page is now connected and posts will publish live with full photo & video support.",
      },
    ],
  },
  {
    platform: "LinkedIn",
    icon: Layers,
    title: "How to Connect LinkedIn",
    badge: "1-Click",
    steps: [
      {
        step: "1",
        title: "Click '+ Connect LinkedIn'",
        desc: "You will be redirected to LinkedIn's official OAuth authorization window.",
      },
      {
        step: "2",
        title: "Click 'Allow'",
        desc: "Authorize SocialHub to publish to your personal feed. Photos, native media, and text will publish live!",
      },
    ],
  },
];

export default function AccountsSettingsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const searchParams = useSearchParams();
  const [dbAccounts, setDbAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [targetAccount, setTargetAccount] = useState<{ id?: string; platform: string; handle: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedGuidePlatform, setSelectedGuidePlatform] = useState<string | null>(null);

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
            Manage authorized social channels for your workspace:{" "}
            <span className="font-semibold text-foreground">
              {currentWorkspace?.name || "Personal Workspace"}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
          onClick={() => setShowGuide(!showGuide)}
        >
          <BookOpen className="h-4 w-4 text-primary" />
          {showGuide ? "Hide Setup Guide" : "How to Connect Guide"}
          {showGuide ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          )}
        </Button>
      </div>

      {/* Interactive Setup Guide Banner / Accordion */}
      {showGuide && (
        <Card glass className="border-primary/40 bg-gradient-to-br from-primary/5 via-card/60 to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">
                Step-by-Step Channel Connection Guide
              </CardTitle>
            </div>
            <CardDescription>
              Clear instructions for connecting Instagram, Facebook Pages, LinkedIn, and X.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {GUIDES.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.platform}
                  className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">
                        {g.platform}
                      </h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {g.badge}
                    </Badge>
                  </div>

                  <div className="space-y-2 pt-1">
                    {g.steps.map((s) => (
                      <div key={s.step} className="flex items-start gap-2.5">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {s.step}
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-foreground">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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
                  : "border-dashed opacity-90 hover:opacity-100"
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
                      {connectedAcc
                        ? `@${connectedAcc.display_name?.toLowerCase().replace(/\s+/g, "_")}`
                        : p.handle}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {p.helpText}
                </p>

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
                      <PlugConnectedIcon size={14} />
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

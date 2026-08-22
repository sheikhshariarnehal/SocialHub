"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useWorkspaceStore } from "@/hooks/use-workspace";
import { getWorkspacePosts } from "@/lib/actions/posts";
import { getWorkspaceAccounts } from "@/lib/actions/social-accounts";
import type { Post, SocialAccount } from "@/lib/database.types";

const RECENT_MESSAGES = [
  {
    id: "msg-1",
    author: "Sarah Chen",
    platform: "Instagram",
    content: "Is there a free trial for the Pro plan? We'd love to test the AI reply agent!",
    time: "15m ago",
    sentiment: "positive",
  },
  {
    id: "msg-2",
    author: "Marcus Vance",
    platform: "LinkedIn",
    content: "Great article on cross-platform workflows. Shared with our entire marketing team.",
    time: "1h ago",
    sentiment: "positive",
  },
  {
    id: "msg-3",
    author: "@dev_samurai",
    platform: "X (Twitter)",
    content: "Can we use our own Gemini API key for post generation?",
    time: "3h ago",
    sentiment: "neutral",
  },
];

export default function DashboardOverviewPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (currentWorkspace?.id) {
        setIsLoading(true);
        const [postsData, accountsData] = await Promise.all([
          getWorkspacePosts(currentWorkspace.id),
          getWorkspaceAccounts(currentWorkspace.id),
        ]);
        setPosts(postsData);
        setAccounts(accountsData);
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentWorkspace?.id]);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const STATS = [
    {
      title: "Published Posts",
      value: publishedCount.toString(),
      change: publishedCount > 0 ? "+100%" : "0",
      isPositive: true,
      icon: Send,
      color: "text-primary",
    },
    {
      title: "Scheduled Upcoming",
      value: scheduledCount.toString(),
      change: scheduledCount > 0 ? "Queued" : "None",
      isPositive: true,
      icon: Calendar,
      color: "text-info",
    },
    {
      title: "Connected Channels",
      value: accounts.length.toString(),
      change: `${accounts.length} active`,
      isPositive: true,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "AI Generation Quota",
      value: "20 / 20",
      change: "Free tier",
      isPositive: false,
      icon: Sparkles,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your channels, scheduled pipeline, and incoming engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <Link href="/compose">
            <Button variant="brand" size="sm" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} glass className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </span>
                <div className={`rounded-lg bg-card/60 p-2 border border-border/50 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    stat.isPositive ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Scheduled Queue (Left 2/3) + Connected Channels (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Scheduled Posts + Recent Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Pipeline */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Publishing Pipeline & History
                </CardTitle>
                <CardDescription>
                  Posts created, published, or scheduled across your connected channels
                </CardDescription>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                View calendar ({posts.length})
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No posts yet. Click &quot;New Post&quot; to publish across your channels!
                </div>
              ) : (
                posts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 transition-all"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-accent/60 flex items-center justify-center shrink-0 text-muted-foreground border border-border/40">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                          {post.content || "Media post"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              post.status === "published"
                                ? "success"
                                : post.status === "scheduled"
                                ? "info"
                                : "secondary"
                            }
                            className="text-[10px] px-2 py-0 capitalize"
                          >
                            {post.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.published_at || post.scheduled_at || post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link href="/calendar">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Inbox Stream */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Interactions
                </CardTitle>
                <CardDescription>
                  Inbound comments and messages awaiting your attention
                </CardDescription>
              </div>
              <Link
                href="/inbox"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                Go to Inbox
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECENT_MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar name={msg.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {msg.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          via {msg.platform}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          • {msg.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                  <Link href={`/inbox?reply=${msg.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">
                      Reply
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Connection Health & AI Engine Hub */}
        <div className="space-y-6">
          {/* Connection Health */}
          <Card glass>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Connected Channels
                </CardTitle>
                <Link href="/settings/accounts">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary px-2">
                    Manage
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Live token status and health across platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading accounts...</div>
              ) : accounts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No accounts connected yet.
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={acc.avatar_url || undefined} name={acc.display_name || acc.platform} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {acc.display_name || `@${acc.platform}_user`}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {acc.platform} • Active
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-success text-xs shrink-0 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-[11px]">Active</span>
                    </div>
                  </div>
                ))
              )}

              <Link href="/settings/accounts" className="block pt-1">
                <Button variant="outline" className="w-full text-xs h-9 gap-2 border-dashed">
                  <Share2 className="h-3.5 w-3.5" />
                  Connect Another Channel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Content Engine Widget */}
          <Card glass className="relative overflow-hidden border-primary/30">
            <div
              className="absolute -right-8 -top-8 w-32 h-32 blur-2xl opacity-20 pointer-events-none rounded-full"
              style={{ background: "oklch(0.68 0.20 268)" }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold">
                  AI Content Engine
                </CardTitle>
              </div>
              <CardDescription>
                Generate engaging posts & hashtags with one click
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Generator
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Announcing 50% summer sale..."
                    className="h-8 flex-1 rounded-lg border border-input bg-card/60 px-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Link href="/compose">
                    <Button variant="brand" size="sm" className="h-8 px-3 text-xs">
                      Draft
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Free Quota: 20 remaining</span>
                <Link href="/settings/ai-providers" className="text-primary hover:underline">
                  Configure BYO Key →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

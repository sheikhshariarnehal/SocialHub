"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Download,
  Calendar,
  ArrowUpRight,
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

const METRICS_SUMMARY = [
  { title: "Total Impressions", value: "148.2K", change: "+32.4%", icon: Eye, isPositive: true },
  { title: "Audience Growth", value: "+1,420", change: "+14.8%", icon: Users, isPositive: true },
  { title: "Engagement Rate", value: "4.8%", change: "+0.9%", icon: Heart, isPositive: true },
  { title: "Total Shares", value: "892", change: "+41.2%", icon: Share2, isPositive: true },
];

const PLATFORM_PERFORMANCE = [
  { platform: "Instagram", followers: "24.5K", reach: "68.4K", engagement: "5.2%", color: "from-pink-500 to-amber-500" },
  { platform: "X (Twitter)", followers: "58.2K", reach: "52.1K", engagement: "3.6%", color: "bg-neutral-900" },
  { platform: "LinkedIn", followers: "14.2K", reach: "27.7K", engagement: "6.8%", color: "bg-[#0A66C2]" },
];

const TOP_POSTS = [
  {
    id: "tp-1",
    title: "🚀 Announcing our Q3 product roadmap: AI scheduling & Unified Inbox",
    platform: "LinkedIn",
    impressions: "18.4K",
    likes: 420,
    comments: 48,
    engagementRate: "7.2%",
  },
  {
    id: "tp-2",
    title: "Design systems are the connective tissue of modern software engineering.",
    platform: "Instagram",
    impressions: "14.1K",
    likes: 890,
    comments: 62,
    engagementRate: "6.7%",
  },
  {
    id: "tp-3",
    title: "Why asynchronous communication wins in 2026. A thread 🧵👇",
    platform: "X (Twitter)",
    impressions: "12.8K",
    likes: 310,
    comments: 84,
    engagementRate: "5.4%",
  },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");

  const handleExport = () => {
    toast.success("Analytics CSV report downloaded!");
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Cross-Platform Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track aggregate growth, engagement rates, and content ROI across all connected channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-xl border border-border bg-card/60 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS_SUMMARY.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} glass className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.title}
                </span>
                <div className="rounded-lg bg-card/60 p-2 border border-border/50 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight">
                  {m.value}
                </span>
                <span className="text-xs font-semibold text-success flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {m.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Platform Comparison Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance by Channel */}
        <Card glass className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Performance by Channel
            </CardTitle>
            <CardDescription>
              Reach and engagement rate breakdown by platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PLATFORM_PERFORMANCE.map((p) => (
              <div
                key={p.platform}
                className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs ${
                        p.color.startsWith("bg-") ? p.color : `bg-gradient-to-r ${p.color}`
                      }`}
                    >
                      {p.platform[0]}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {p.platform}
                    </span>
                  </div>
                  <Badge variant="brand" className="text-xs">
                    {p.engagement} Eng. Rate
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Followers</p>
                    <p className="font-semibold text-foreground mt-0.5">{p.followers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Total Reach</p>
                    <p className="font-semibold text-foreground mt-0.5">{p.reach}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Avg Engagement</p>
                    <p className="font-semibold text-foreground mt-0.5">{p.engagement}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audience Growth Insight */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Audience Growth Insight
            </CardTitle>
            <CardDescription>
              Fastest growing demographics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <TrendingUp className="h-4 w-4" />
                <span>LinkedIn Outperforming</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LinkedIn post reach surged <strong>+48%</strong> after implementing AI-assisted executive tone rewrites.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                Peak Engagement Window
              </p>
              <p className="text-xs text-foreground">
                <strong>Wednesdays & Thursdays</strong> between 1:00 PM – 3:30 PM UTC generate 2.4x more interactions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content Table */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top Performing Content
          </CardTitle>
          <CardDescription>
            Posts that generated highest engagement in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="pb-3 font-semibold">Content</th>
                  <th className="pb-3 font-semibold">Platform</th>
                  <th className="pb-3 font-semibold">Impressions</th>
                  <th className="pb-3 font-semibold">Likes</th>
                  <th className="pb-3 font-semibold">Comments</th>
                  <th className="pb-3 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {TOP_POSTS.map((post) => (
                  <tr key={post.id} className="hover:bg-card/40 transition-colors">
                    <td className="py-3.5 pr-4 font-medium text-foreground max-w-sm truncate">
                      {post.title}
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant="outline" className="text-[10px]">
                        {post.platform}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-foreground font-mono">{post.impressions}</td>
                    <td className="py-3.5 pr-4 text-foreground font-mono">{post.likes}</td>
                    <td className="py-3.5 pr-4 text-foreground font-mono">{post.comments}</td>
                    <td className="py-3.5 text-success font-semibold">{post.engagementRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

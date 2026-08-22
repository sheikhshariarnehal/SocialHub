"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Post Published Successfully",
    desc: "Your carousel post went live on Instagram & LinkedIn.",
    time: "10m ago",
    type: "success",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    id: "2",
    title: "New Mentions on X",
    desc: "@techguru mentioned your product in a viral thread.",
    time: "1h ago",
    type: "mention",
    icon: MessageSquare,
    color: "text-info",
  },
  {
    id: "3",
    title: "Token Expiring Soon",
    desc: "LinkedIn connection token needs renewal in 3 days.",
    time: "4h ago",
    type: "warning",
    icon: AlertTriangle,
    color: "text-warning",
  },
];

export function TopBar() {
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search posts, drafts, scheduled items, or comments..."
            className="h-9 w-full rounded-xl border border-border bg-card/40 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Compose Button */}
        <Link href="/compose">
          <Button variant="brand" size="sm" className="h-9 gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Create Post</span>
          </Button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-popover p-3 shadow-2xl animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer text-left"
                      >
                        <div className={`mt-0.5 shrink-0 ${n.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <Link href="/settings/profile" className="flex items-center gap-2 pl-2">
          <Avatar name={userName} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-foreground leading-none">
              {userName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px] mt-0.5">
              {user?.email || "Pro Plan"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

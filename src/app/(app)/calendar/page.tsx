"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Send,
  MoreVertical,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduledItem {
  id: string;
  day: number; // Day of current month
  time: string;
  content: string;
  platforms: ("instagram" | "twitter" | "linkedin")[];
  status: "scheduled" | "published" | "draft";
  mediaUrl?: string;
}

const SCHEDULED_POSTS: ScheduledItem[] = [
  {
    id: "cal-1",
    day: 22,
    time: "2:00 PM",
    content: "🚀 Announcing our Q3 roadmap: AI-driven scheduling & unified inbox.",
    platforms: ["linkedin", "twitter"],
    status: "scheduled",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
  },
  {
    id: "cal-2",
    day: 23,
    time: "9:30 AM",
    content: "Design systems are the connective tissue of modern software engineering. 🎨",
    platforms: ["instagram", "linkedin"],
    status: "scheduled",
  },
  {
    id: "cal-3",
    day: 24,
    time: "4:00 PM",
    content: "Behind the scenes at our new remote HQ. The team is shipping faster than ever!",
    platforms: ["instagram", "twitter"],
    status: "scheduled",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100",
  },
  {
    id: "cal-4",
    day: 19,
    time: "11:00 AM",
    content: "Weekly product update: 5 improvements to our customer dashboard.",
    platforms: ["linkedin"],
    status: "published",
  },
  {
    id: "cal-5",
    day: 27,
    time: "1:00 PM",
    content: "Why asynchronous communication wins in 2026. A thread 🧵👇",
    platforms: ["twitter"],
    status: "scheduled",
  },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("August 2026");

  // Generate 31 days for the calendar grid
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual pipeline of all scheduled, published, and drafted posts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border bg-card/60 p-1">
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold">{currentMonth}</span>
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Link href="/compose">
            <Button variant="brand" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Schedule Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card glass className="overflow-hidden p-0 border-border/80">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border/80 bg-muted/30 text-center text-xs font-bold text-muted-foreground py-3">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/50">
          {/* Pad the first 6 days of the week for August starting on Saturday */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[120px] bg-card/20 p-2 text-muted-foreground/30 text-xs"
            >
              {26 + i}
            </div>
          ))}

          {days.map((day) => {
            const postsForDay = SCHEDULED_POSTS.filter((p) => p.day === day);
            const isToday = day === 22;

            return (
              <div
                key={day}
                className={`group min-h-[130px] p-2 transition-colors relative ${
                  isToday ? "bg-primary/5" : "bg-card/40 hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  <Link
                    href={`/compose?date=2026-08-${day.toString().padStart(2, "0")}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary"
                    title="Add post for this date"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Posts for this day */}
                <div className="mt-2 space-y-1.5">
                  {postsForDay.map((post) => (
                    <Link
                      key={post.id}
                      href={`/compose?edit=${post.id}`}
                      className={`block rounded-lg border p-2 text-left transition-all hover:scale-[1.02] shadow-xs ${
                        post.status === "published"
                          ? "border-success/30 bg-success/10"
                          : "border-primary/30 bg-primary/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground mb-1">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Clock className="h-3 w-3" />
                          {post.time}
                        </span>
                        <div className="flex gap-0.5">
                          {post.platforms.map((p) => (
                            <span
                              key={p}
                              className="h-1.5 w-1.5 rounded-full bg-primary"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-[11px] font-medium text-foreground leading-tight">
                        {post.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

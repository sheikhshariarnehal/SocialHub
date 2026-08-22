"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Send,
  Calendar as CalendarIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useWorkspaceStore } from "@/hooks/use-workspace";
import { getWorkspacePosts, deletePost } from "@/lib/actions/posts";
import type { Post } from "@/lib/database.types";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [currentMonth] = useState("August 2026");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    if (currentWorkspace?.id) {
      setIsLoading(true);
      const data = await getWorkspacePosts(currentWorkspace.id);
      setPosts(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentWorkspace?.id]);

  const handleDelete = async (postId: string) => {
    const res = await deletePost(postId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Post removed.");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

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
              Create Post
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
            const dayPosts = posts.filter((p) => {
              const dateStr = p.scheduled_at || p.published_at || p.created_at;
              if (!dateStr) return false;
              const date = new Date(dateStr);
              return date.getDate() === day;
            });

            return (
              <div
                key={day}
                className="min-h-[130px] p-2 hover:bg-card/40 transition-colors flex flex-col justify-between group relative"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold ${
                      day === 22
                        ? "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center -ml-1"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground/80">
                      {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group/item relative rounded-lg border border-border/70 bg-card p-2 text-xs shadow-xs hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge
                          variant={
                            post.status === "published"
                              ? "success"
                              : post.status === "scheduled"
                              ? "info"
                              : "secondary"
                          }
                          className="text-[9px] px-1.5 py-0 capitalize"
                        >
                          {post.status}
                        </Badge>

                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5"
                          title="Delete post"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="line-clamp-2 text-[11px] leading-tight text-foreground font-medium">
                        {post.content || "Media post"}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/compose`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary flex items-center gap-0.5 mt-1 font-semibold"
                >
                  <Plus className="h-2.5 w-2.5" /> Add
                </Link>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity Stream */}
      <div className="space-y-3">
        <h2 className="text-base font-bold tracking-tight">Recent Posts & Publications</h2>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card glass className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No posts created yet.</p>
            <Link href="/compose" className="mt-3 inline-block">
              <Button variant="brand" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create your first post
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Card key={post.id} glass className="p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        post.status === "published"
                          ? "success"
                          : post.status === "scheduled"
                          ? "info"
                          : "secondary"
                      }
                      className="capitalize text-[10px]"
                    >
                      {post.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(post.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

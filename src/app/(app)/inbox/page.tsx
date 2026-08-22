"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Inbox as InboxIcon,
  RefreshCw,
  Search,
  Filter,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentCard, type CommentItem } from "@/components/inbox/comment-card";

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c-1",
    author: "Sarah Chen",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
    platform: "instagram",
    type: "comment",
    content: "Is there a free trial for the Pro plan? We'd love to test the AI reply agent on our store account!",
    sentiment: "positive",
    timeAgo: "15m ago",
    status: "unread",
  },
  {
    id: "c-2",
    author: "Marcus Vance",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
    platform: "linkedin",
    type: "comment",
    content: "Great article on cross-platform workflows. Shared with our entire marketing team at Acme.",
    sentiment: "positive",
    timeAgo: "1h ago",
    status: "unread",
  },
  {
    id: "c-3",
    author: "@dev_samurai",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80",
    platform: "twitter",
    type: "mention",
    content: "Can we use our own Gemini API key for post generation? Or are we locked into OpenAI?",
    sentiment: "neutral",
    timeAgo: "3h ago",
    status: "unread",
  },
  {
    id: "c-4",
    author: "Elena Rostova",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80",
    platform: "instagram",
    type: "dm",
    content: "Hi team! We're looking to integrate our custom webhook for CRM leads. Is that available on the agency tier?",
    sentiment: "positive",
    timeAgo: "5h ago",
    status: "replied",
  },
  {
    id: "c-5",
    author: "TechReviewDaily",
    authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80",
    platform: "twitter",
    type: "mention",
    content: "Tried out 4 social media management tools this week. @SocialHub is by far the fastest. The BYO AI key feature is a game changer.",
    sentiment: "positive",
    timeAgo: "1d ago",
    status: "read",
  },
];

export default function InboxPage() {
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "mentions" | "dms">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Synchronized latest comments from all connected channels!");
    }, 800);
  };

  const handleReply = async (commentId: string, replyText: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, status: "replied" } : c
      )
    );
    toast.success("Reply dispatched to platform!");
  };

  const handleMarkRead = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: "read" } : c))
    );
    toast.success("Marked as read");
  };

  const handleArchive = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    toast.success("Message archived");
  };

  const handleMarkAllRead = () => {
    setComments((prev) => prev.map((c) => ({ ...c, status: "read" })));
    toast.success("All messages marked as read");
  };

  const filteredComments = comments.filter((c) => {
    if (activeTab === "unread" && c.status !== "unread") return false;
    if (activeTab === "mentions" && c.type !== "mention") return false;
    if (activeTab === "dms" && c.type !== "dm") return false;
    if (platformFilter !== "all" && c.platform !== platformFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.author.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = comments.filter((c) => c.status === "unread").length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Unified Inbox
            </h1>
            {unreadCount > 0 && (
              <Badge variant="brand" className="text-xs">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Incoming comments, mentions, and messages from all connected channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>

          <Button
            variant="brand"
            size="sm"
            className="gap-1.5 text-xs"
            isLoading={isSyncing}
            onClick={handleSync}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Feeds
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center rounded-xl border border-border bg-card/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "all"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "unread"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab("mentions")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "mentions"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mentions
          </button>
          <button
            onClick={() => setActiveTab("dms")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "dms"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            DMs
          </button>
        </div>

        {/* Search & Platform Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-card/50 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card/50 px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={(replyText) => handleReply(comment.id, replyText)}
              onMarkRead={() => handleMarkRead(comment.id)}
              onArchive={() => handleArchive(comment.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/20 p-12 text-center">
            <InboxIcon className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-semibold text-foreground">
              Inbox Zero!
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              You have caught up with all customer comments and mentions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

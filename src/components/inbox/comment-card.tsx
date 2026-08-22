"use client";

import { useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  Archive,
  Reply,
  MoreVertical,
  ThumbsUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReplyComposer } from "./reply-composer";

export interface CommentItem {
  id: string;
  author: string;
  authorAvatar?: string;
  platform: "instagram" | "twitter" | "linkedin" | "facebook";
  type: "comment" | "mention" | "dm";
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  timeAgo: string;
  status: "unread" | "read" | "replied" | "archived";
}

export function CommentCard({
  comment,
  onReply,
  onMarkRead,
  onArchive,
}: {
  comment: CommentItem;
  onReply: (replyText: string) => Promise<void>;
  onMarkRead: () => void;
  onArchive: () => void;
}) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        comment.status === "unread"
          ? "border-primary/40 bg-card/80 shadow-xs"
          : "border-border/60 bg-card/40 opacity-90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Author + Platform */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar
            src={comment.authorAvatar}
            name={comment.author}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground">
                {comment.author}
              </span>
              <Badge
                variant={
                  comment.platform === "instagram"
                    ? "instagram"
                    : comment.platform === "linkedin"
                    ? "linkedin"
                    : "twitter"
                }
                className="text-[10px] px-2 py-0"
              >
                {comment.platform.charAt(0).toUpperCase() + comment.platform.slice(1)}
              </Badge>
              <Badge
                variant={
                  comment.sentiment === "positive"
                    ? "success"
                    : comment.sentiment === "negative"
                    ? "destructive"
                    : "secondary"
                }
                className="text-[10px] px-1.5 py-0 capitalize"
              >
                {comment.sentiment}
              </Badge>
              <span className="text-[10px] text-muted-foreground ml-auto sm:ml-0">
                {comment.timeAgo}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-foreground mt-2">
              {comment.content}
            </p>
          </div>
        </div>

        {/* Quick action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {comment.status === "unread" && (
            <button
              onClick={onMarkRead}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onArchive}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Bar / Reply Trigger */}
      {!isReplying && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2">
            {comment.status === "replied" ? (
              <span className="text-[11px] font-medium text-success flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Replied
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary gap-1 px-2"
                onClick={() => setIsReplying(true)}
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Inline Reply Composer */}
      {isReplying && (
        <div className="mt-3">
          <ReplyComposer
            parentAuthor={comment.author}
            parentContent={comment.content}
            onCancel={() => setIsReplying(false)}
            onSend={async (replyText) => {
              await onReply(replyText);
              setIsReplying(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

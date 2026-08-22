"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Repeat2,
  ThumbsUp,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MediaFile } from "./media-upload";

export function PlatformPreview({
  content,
  media,
  selectedPlatforms,
}: {
  content: string;
  media: MediaFile[];
  selectedPlatforms: string[];
}) {
  const [activeTab, setActiveTab] = useState(
    selectedPlatforms[0] || "instagram"
  );

  const displayContent =
    content || "Your post caption will appear here in real-time...";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Mock Preview
        </span>

        {/* Platform switcher tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="instagram" className="text-xs px-2.5 py-1">
              Instagram
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs px-2.5 py-1">
              X (Twitter)
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="text-xs px-2.5 py-1">
              LinkedIn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Instagram Preview */}
      {activeTab === "instagram" && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg max-w-sm mx-auto animate-in fade-in-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                name="Acme"
                size="sm"
              />
              <div>
                <p className="text-xs font-bold text-foreground">acmedesign</p>
                <p className="text-[10px] text-muted-foreground">Original audio</p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Media Container */}
          <div className="relative aspect-square w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
            {media.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media[0].url}
                alt="Preview media"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground text-xs">
                <span>[No image attached — text-only post]</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-foreground">
                <Heart className="h-5 w-5" />
                <MessageCircle className="h-5 w-5" />
                <Send className="h-5 w-5" />
              </div>
              <Bookmark className="h-5 w-5 text-foreground" />
            </div>

            <p className="text-[11px] font-bold text-foreground">1,248 likes</p>

            {/* Caption */}
            <div className="text-xs leading-relaxed">
              <span className="font-bold mr-1.5 text-foreground">acmedesign</span>
              <span className="text-muted-foreground whitespace-pre-wrap">
                {displayContent}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground/60 uppercase">
              2 hours ago
            </p>
          </div>
        </div>
      )}

      {/* X / Twitter Preview */}
      {activeTab === "twitter" && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-lg max-w-sm mx-auto space-y-3 animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <Avatar
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
              name="Acme HQ"
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  Acme HQ
                </span>
                <span className="text-[11px] text-muted-foreground">
                  @acme_hq · 1m
                </span>
              </div>
              <p className="text-xs leading-relaxed text-foreground mt-1 whitespace-pre-wrap">
                {displayContent}
              </p>

              {media.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border/60 aspect-video bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media[0].url}
                    alt="Twitter media"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between text-muted-foreground mt-3 pt-1 text-xs">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> 14
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3.5 w-3.5" /> 8
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> 89
                </span>
                <span className="flex items-center gap-1">
                  <Share className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Preview */}
      {activeTab === "linkedin" && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-lg max-w-sm mx-auto space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80"
                name="Acme Agency"
                size="md"
              />
              <div>
                <p className="text-xs font-bold text-foreground leading-none">
                  Acme Agency Inc.
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  14,200 followers • Promoted
                </p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
            {displayContent}
          </p>

          {media.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border/60 aspect-video bg-neutral-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media[0].url}
                alt="LinkedIn media"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5 text-[#0A66C2]" /> Like
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> Comment
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3.5 w-3.5" /> Repost
            </span>
            <span className="flex items-center gap-1">
              <Send className="h-3.5 w-3.5" /> Send
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

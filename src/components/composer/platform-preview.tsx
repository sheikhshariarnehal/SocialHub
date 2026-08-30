"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Repeat2,
  ThumbsUp,
  MoreHorizontal,
  Send,
  Play,
  Film,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedPostContent } from "./formatted-post-content";
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
    selectedPlatforms[0] || "linkedin"
  );
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activeTab)) {
      setActiveTab(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activeTab]);

  const renderMediaContent = (aspectClass = "aspect-video") => {
    if (media.length === 0) return null;

    const first = media[0];
    if (first.type === "video") {
      return (
        <div className={`relative overflow-hidden rounded-xl border border-border/60 ${aspectClass} bg-neutral-950 flex items-center justify-center`}>
          <video
            src={first.url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (media.length === 1) {
      return (
        <div className={`overflow-hidden rounded-xl border border-border/60 ${aspectClass} bg-neutral-950`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first.url}
            alt="Attached media"
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    // Multi-image grid
    return (
      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl border border-border/60 bg-neutral-950">
        {media.slice(0, 4).map((m, idx) => (
          <div key={m.id} className="relative aspect-square overflow-hidden bg-neutral-900">
            {m.type === "video" ? (
              <video src={m.url} className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
            )}
            {idx === 3 && media.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-base">
                +{media.length - 3}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </span>

        {/* Platform switcher tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="linkedin" className="text-xs px-2.5 py-1">
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="facebook" className="text-xs px-2.5 py-1">
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="text-xs px-2.5 py-1">
              Instagram
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs px-2.5 py-1">
              X (Twitter)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* LinkedIn Preview */}
      {activeTab === "linkedin" && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-lg max-w-sm mx-auto space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80"
                name="Shekh Shariar Nehal"
                size="md"
              />
              <div>
                <p className="text-xs font-bold text-foreground leading-none">
                  Shekh Shariar Nehal
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Full-Stack Developer • Just now • 🌐
                </p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          <FormattedPostContent
            content={content}
            platform="linkedin"
            className="text-xs"
          />

          {renderMediaContent("aspect-video")}

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 hover:text-[#0A66C2] cursor-pointer transition-colors">
              <ThumbsUp className="h-3.5 w-3.5 text-[#0A66C2]" /> Like
            </span>
            <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Comment
            </span>
            <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
              <Repeat2 className="h-3.5 w-3.5" /> Repost
            </span>
            <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
              <Send className="h-3.5 w-3.5" /> Send
            </span>
          </div>
        </div>
      )}

      {/* Facebook Preview */}
      {activeTab === "facebook" && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-lg max-w-sm mx-auto space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80"
                name="Nimon Solutions Ltd."
                size="md"
              />
              <div>
                <p className="text-xs font-bold text-foreground leading-none">
                  Nimon Solutions Ltd.
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Just now • 🌍 Public
                </p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          <FormattedPostContent
            content={content}
            platform="facebook"
            className="text-xs"
          />

          {renderMediaContent("aspect-video")}

          <div className="flex items-center justify-around border-t border-border/40 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-[#1877F2] font-semibold cursor-pointer">
              <ThumbsUp className="h-3.5 w-3.5" /> Like
            </span>
            <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
              <MessageCircle className="h-3.5 w-3.5" /> Comment
            </span>
            <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
              <Share className="h-3.5 w-3.5" /> Share
            </span>
          </div>
        </div>
      )}

      {/* Instagram Preview */}
      {activeTab === "instagram" && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg max-w-sm mx-auto animate-in fade-in-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                name="Instagram User"
                size="sm"
              />
              <div>
                <p className="text-xs font-bold text-foreground">nimon_solutions</p>
                <p className="text-[10px] text-muted-foreground">Original audio</p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Media Container */}
          <div className="relative aspect-square w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
            {media.length > 0 ? (
              media[activeCarouselIdx]?.type === "video" ? (
                <video
                  src={media[activeCarouselIdx].url}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media[activeCarouselIdx]?.url || media[0].url}
                  alt="Preview media"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="text-center p-6 text-muted-foreground text-xs">
                <span>[No image attached — text-only post]</span>
              </div>
            )}

            {/* Instagram Multi-Photo Indicator */}
            {media.length > 1 && (
              <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                {activeCarouselIdx + 1}/{media.length}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-foreground">
                <Heart className="h-5 w-5 hover:text-destructive cursor-pointer transition-colors" />
                <MessageCircle className="h-5 w-5 cursor-pointer" />
                <Send className="h-5 w-5 cursor-pointer" />
              </div>
              <Bookmark className="h-5 w-5 text-foreground cursor-pointer" />
            </div>

            <p className="text-[11px] font-bold text-foreground">512 likes</p>

            {/* Caption */}
            <div className="text-xs leading-relaxed">
              <span className="font-bold mr-1.5 text-foreground">nimon_solutions</span>
              <FormattedPostContent
                content={content}
                platform="instagram"
                className="inline text-muted-foreground"
              />
            </div>

            <p className="text-[10px] text-muted-foreground/60 uppercase">
              Just now
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
              name="SocialHub User"
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  SocialHub User
                </span>
                <span className="text-[11px] text-muted-foreground">
                  @socialhub · 1m
                </span>
              </div>

              <FormattedPostContent
                content={content}
                platform="twitter"
                className="text-xs mt-1"
              />

              {renderMediaContent("aspect-video mt-3")}

              {/* Interactions */}
              <div className="flex items-center justify-between text-muted-foreground mt-3 pt-1 text-xs">
                <span className="flex items-center gap-1 hover:text-primary cursor-pointer">
                  <MessageCircle className="h-3.5 w-3.5" /> 14
                </span>
                <span className="flex items-center gap-1 hover:text-success cursor-pointer">
                  <Repeat2 className="h-3.5 w-3.5" /> 8
                </span>
                <span className="flex items-center gap-1 hover:text-destructive cursor-pointer">
                  <Heart className="h-3.5 w-3.5" /> 89
                </span>
                <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                  <Share className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

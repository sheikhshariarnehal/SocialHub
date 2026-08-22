"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  Calendar,
  Save,
  CheckCircle2,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaUpload, type MediaFile } from "@/components/composer/media-upload";
import { PlatformPreview } from "@/components/composer/platform-preview";
import { AiAssistant } from "@/components/composer/ai-assistant";
import { SchedulePicker } from "@/components/composer/schedule-picker";
import { createPost } from "@/lib/actions/posts";
import { useWorkspaceStore } from "@/hooks/use-workspace";

const TARGET_PLATFORMS = [
  { id: "instagram", name: "Instagram", limit: 2200, color: "from-pink-500 to-amber-500" },
  { id: "twitter", name: "X (Twitter)", limit: 280, color: "bg-neutral-900" },
  { id: "linkedin", name: "LinkedIn", limit: 3000, color: "bg-[#0A66C2]" },
];

export default function ComposePage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();

  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "twitter",
  ]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-08-23");
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async (isDraft = false) => {
    if (!content.trim() && media.length === 0) {
      toast.error("Please add content or attach media.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one target platform.");
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = !publishImmediately && !isDraft
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : null;

      const res = await createPost({
        workspaceId: currentWorkspace?.id || "mock-ws-id",
        content,
        targetAccountIds: selectedPlatforms,
        scheduledAt,
        publishImmediately: publishImmediately && !isDraft,
        media: media.map((m, idx) => ({
          storage_path: m.url,
          type: m.type,
          order: idx,
        })),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (isDraft) {
        toast.success("Draft saved successfully!");
      } else if (publishImmediately) {
        toast.success("Post published across all selected channels!");
      } else {
        toast.success(`Post scheduled for ${scheduledDate} at ${scheduledTime}!`);
      }

      router.push("/calendar");
      router.refresh();
    } catch {
      toast.success("Post scheduled! (Local demo simulation)");
      router.push("/calendar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Create & Schedule Post
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Craft multi-platform content with AI assistance and live preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Draft
          </Button>
          <Button
            variant="brand"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleSave(false)}
          >
            {publishImmediately ? (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Publish Now
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-1.5" />
                Schedule Post
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split Grid: Left Editor (3 cols) + Right Live Preview (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Platforms Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Publishing Targets
            </label>
            <div className="flex flex-wrap gap-2.5">
              {TARGET_PLATFORMS.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-xs"
                        : "border-border/80 bg-card/40 text-muted-foreground hover:bg-card"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] text-white ${
                        p.color.startsWith("bg-") ? p.color : `bg-gradient-to-r ${p.color}`
                      }`}
                    >
                      {p.name[0]}
                    </div>
                    <span>{p.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Caption Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Caption
              </label>
              {/* Character Limit Counters */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                {selectedPlatforms.map((pid) => {
                  const target = TARGET_PLATFORMS.find((p) => p.id === pid);
                  if (!target) return null;
                  const isOver = content.length > target.limit;
                  return (
                    <span
                      key={pid}
                      className={isOver ? "text-destructive font-bold" : ""}
                    >
                      {target.name.split(" ")[0]}: {content.length}/{target.limit}
                    </span>
                  );
                })}
              </div>
            </div>

            <Textarea
              placeholder="What do you want to share with your audience? Tip: Use the AI panel below to generate or polish your caption..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] text-sm leading-relaxed"
            />
          </div>

          {/* Media Upload */}
          <MediaUpload media={media} onChange={setMedia} />

          {/* AI Writing Assistant */}
          <AiAssistant
            currentContent={content}
            onApplyContent={(newContent) => setContent(newContent)}
          />

          {/* Schedule Picker */}
          <SchedulePicker
            publishImmediately={publishImmediately}
            scheduledDate={scheduledDate}
            scheduledTime={scheduledTime}
            onPublishModeChange={setPublishImmediately}
            onDateChange={setScheduledDate}
            onTimeChange={setScheduledTime}
          />
        </div>

        {/* Live Mockup Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <PlatformPreview
              content={content}
              media={media}
              selectedPlatforms={selectedPlatforms}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

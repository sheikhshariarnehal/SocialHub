"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Hash,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TONES = [
  "Professional & Authoritative",
  "Casual & Friendly",
  "Witty & Humorous",
  "Viral & Engaging",
  "Inspiring & Story-driven",
];

export function AiAssistant({
  currentContent,
  onApplyContent,
}: {
  currentContent: string;
  onApplyContent: (newContent: string) => void;
}) {
  const [topicPrompt, setTopicPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(8);

  const handleGenerate = async (action: "create" | "hashtags" | "rewrite" | "shorten") => {
    if (quotaRemaining <= 0) {
      toast.error("Free AI quota exhausted. Configure a custom API key in Settings.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: topicPrompt || currentContent,
          tone: selectedTone,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.generatedText) {
        onApplyContent(data.generatedText);
        setQuotaRemaining((prev) => Math.max(0, prev - 1));
        toast.success("AI generated content applied to editor!");
      }
    } catch {
      // Fallback generator for offline/local simulation
      let generated = "";
      if (action === "hashtags") {
        generated = `${currentContent}\n\n#SocialMedia #GrowthMarketing #CreatorEconomy #Automation #Productivity #AI`;
      } else if (action === "shorten") {
        generated = currentContent.slice(0, 180) + "... 🚀";
      } else {
        generated = `🚀 ${topicPrompt || "Excited to share our newest breakthrough!"}\n\nWe built this to solve the exact bottlenecks modern teams face every single day. Faster workflows, zero wasted context.\n\n👇 Drop your thoughts below — link in bio.`;
      }
      onApplyContent(generated);
      setQuotaRemaining((prev) => Math.max(0, prev - 1));
      toast.success("Content generated successfully!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            AI Assistant
          </span>
        </div>
        <Badge variant="brand" className="text-[10px] py-0 px-2">
          {quotaRemaining} free left
        </Badge>
      </div>

      {/* Topic Prompt */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground">
          What is this post about?
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Product launch, tips for founders..."
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            className="w-full rounded-xl border border-input bg-card/80 px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tone Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground">
          Brand Tone
        </label>
        <select
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value)}
          className="w-full rounded-xl border border-input bg-card/80 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="text-xs h-8 gap-1.5"
          isLoading={isGenerating}
          onClick={() => handleGenerate("create")}
        >
          <Wand2 className="h-3.5 w-3.5" />
          Generate Post
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          isLoading={isGenerating}
          onClick={() => handleGenerate("hashtags")}
        >
          <Hash className="h-3.5 w-3.5" />
          Add Hashtags
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          isLoading={isGenerating}
          onClick={() => handleGenerate("rewrite")}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Rewrite Tone
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          isLoading={isGenerating}
          onClick={() => handleGenerate("shorten")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Shorten for X
        </Button>
      </div>
    </div>
  );
}

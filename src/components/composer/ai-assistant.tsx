"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  Hash,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Cpu,
  Settings2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAIProvidersStore,
  type AIProviderItem,
} from "@/hooks/use-ai-providers";

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
  const { providers, getActiveProvider, setDefaultProvider } =
    useAIProvidersStore();

  const activeProvider = getActiveProvider();
  const [topicPrompt, setTopicPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [freeQuotaRemaining, setFreeQuotaRemaining] = useState(8);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  const isBYO = activeProvider.providerType !== "free_default";

  const handleGenerate = async (
    action: "create" | "hashtags" | "rewrite" | "shorten"
  ) => {
    // If using free tier and quota is exhausted
    if (!isBYO && freeQuotaRemaining <= 0) {
      toast.error(
        "Free AI quota exhausted. Configure your OpenRouter or OpenAI key in Settings for unlimited generations!"
      );
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: topicPrompt.trim() || currentContent.trim(),
          tone: selectedTone,
          provider: activeProvider.providerType,
          apiKey: activeProvider.apiKey,
          model: activeProvider.defaultModel,
          baseUrl: activeProvider.baseUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(
          data.error || "AI generation failed. Please check your provider configuration."
        );
        return;
      }

      if (data.generatedText) {
        onApplyContent(data.generatedText);

        if (!isBYO) {
          setFreeQuotaRemaining((prev) => Math.max(0, prev - 1));
        }

        const modelLabel = data.modelUsed ? ` (${data.modelUsed})` : "";
        toast.success(`Generated via ${data.providerUsed}${modelLabel}!`);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to connect to AI service"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 space-y-4 backdrop-blur-md relative">
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

        {/* Active Provider Indicator / Quick Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isBYO
                ? "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25"
                : "bg-primary/10 border-primary/25 text-primary hover:bg-primary/20"
            }`}
          >
            <Cpu className="h-3 w-3" />
            <span className="max-w-[130px] truncate">
              {activeProvider.name}: {activeProvider.defaultModel?.split("/").pop() || "Default"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {/* Dropdown Menu */}
          {showProviderMenu && (
            <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Select Active Model
              </div>

              <div className="space-y-1">
                {providers.map((p) => {
                  const isCurrent = p.id === activeProvider.id;
                  const isActive = p.status === "active";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!isActive}
                      onClick={() => {
                        setDefaultProvider(p.id);
                        setShowProviderMenu(false);
                        toast.success(`Switched active AI model to ${p.name}`);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        isCurrent
                          ? "bg-primary/15 text-primary font-medium"
                          : isActive
                          ? "hover:bg-accent text-foreground"
                          : "opacity-40 cursor-not-allowed text-muted-foreground"
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="font-semibold text-[11px]">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate font-mono">
                          {isActive ? p.defaultModel : "Not configured"}
                        </div>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border/60 mt-1.5 pt-1.5">
                <Link
                  href="/settings/ai-providers"
                  onClick={() => setShowProviderMenu(false)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Settings2 className="h-3.5 w-3.5" />
                    Configure Providers
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quota / Status Badge */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Active Model: <strong className="text-foreground font-mono">{activeProvider.defaultModel}</strong></span>
        {isBYO ? (
          <Badge variant="success" dot className="text-[10px] py-0 px-2">
            Unlimited BYO Key
          </Badge>
        ) : (
          <Badge variant="brand" className="text-[10px] py-0 px-2">
            {freeQuotaRemaining} free left
          </Badge>
        )}
      </div>

      {/* Topic Prompt */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground">
          What is this post about?
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Bangladesh economic growth, SaaS startup tips, product launch..."
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

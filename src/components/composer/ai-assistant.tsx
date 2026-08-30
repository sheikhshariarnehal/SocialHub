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
  Gift,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useMountedAIProviders,
  type AIProviderItem,
  NVIDIA_POPULAR_MODELS,
  OPENROUTER_FREE_MODELS,
} from "@/hooks/use-ai-providers";

const TONES = [
  "Professional & Authoritative",
  "Casual & Friendly",
  "Witty & Humorous",
  "Viral & Engaging",
  "Inspiring & Story-driven",
];

const TOP_NVIDIA_QUICK_MODELS = [
  { id: "nvidia/nemotron-3.5-lightning-30b-a3b", name: "Nemotron 3.5 Lightning (Default)" },
  { id: "moonshotai/kimi-k3", name: "Moonshot Kimi K3" },
  { id: "meta/llama-3.3-70b-instruct", name: "Meta Llama 3.3 70B" },
  { id: "deepseek-ai/deepseek-r1", name: "DeepSeek R1 (NVIDIA)" },
];

const TOP_OPENROUTER_QUICK_MODELS = [
  { id: "z-ai/glm-5.2:free", name: "Z.ai GLM 5.2 (Free)" },
  { id: "minimax/minimax-m3:free", name: "MiniMax M3 (Free, 1M)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 (Free, 1M)" },
  { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B (Free)" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
];

export function AiAssistant({
  currentContent,
  onApplyContent,
}: {
  currentContent: string;
  onApplyContent: (newContent: string) => void;
}) {
  const { providers, activeProvider, setDefaultProvider, saveProvider, isMounted } =
    useMountedAIProviders();

  const [topicPrompt, setTopicPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [freeQuotaRemaining, setFreeQuotaRemaining] = useState(8);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  const isBYO = activeProvider.providerType !== "free_default";
  const isNvidia = activeProvider.providerType === "nvidia";
  const isOpenRouter = activeProvider.providerType === "openrouter";

  const handleSelectModel = (providerId: string, modelId: string, modelName: string) => {
    const targetProvider = providers.find((p) => p.id === providerId);
    if (targetProvider && targetProvider.apiKey) {
      saveProvider({
        id: providerId,
        apiKey: targetProvider.apiKey,
        model: modelId,
        latency: targetProvider.latency,
      });
      setShowProviderMenu(false);
      toast.success(`Switched model to ${modelName}`);
    }
  };

  const handleGenerate = async (
    action: "create" | "hashtags" | "rewrite" | "shorten"
  ) => {
    // If using free tier and quota is exhausted
    if (!isBYO && freeQuotaRemaining <= 0) {
      toast.error(
        "Free AI quota exhausted. Configure your NVIDIA or OpenRouter key in Settings for unlimited generations!"
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

        const modelLabel = data.modelUsed ? ` (${data.modelUsed.split("/").pop()})` : "";
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
              isNvidia
                ? "bg-[#76B900]/15 border-[#76B900]/30 text-[#76B900] hover:bg-[#76B900]/25"
                : isBYO
                ? "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25"
                : "bg-primary/10 border-primary/25 text-primary hover:bg-primary/20"
            }`}
          >
            <Cpu className="h-3 w-3" />
            <span className="max-w-[150px] truncate">
              {activeProvider.name}: {activeProvider.defaultModel?.split("/").pop() || "Default"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {/* Dropdown Menu */}
          {showProviderMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-md z-50 animate-in fade-in-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Select Active Provider
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        isCurrent
                          ? "bg-primary/15 text-primary font-medium"
                          : isActive
                          ? "hover:bg-accent text-foreground"
                          : "opacity-40 cursor-not-allowed text-muted-foreground"
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="font-semibold text-[11px] flex items-center gap-1">
                          {p.name}
                          {p.id === "p-nvidia" && (
                            <span className="text-[8px] bg-[#76B900]/20 text-[#76B900] px-1 rounded font-bold">
                              NVIDIA
                            </span>
                          )}
                          {p.defaultModel?.includes(":free") && (
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">
                              FREE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate font-mono">
                          {isActive ? p.defaultModel : "Not configured"}
                        </div>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* If NVIDIA NIM is Active, Show Quick Models Switcher */}
              {isNvidia && activeProvider.status === "active" && (
                <div className="mt-2 pt-2 border-t border-border/60">
                  <div className="px-2 py-1 text-[10px] font-semibold text-[#76B900] uppercase tracking-wider flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Quick Switch NVIDIA NIM Model
                  </div>
                  <div className="space-y-0.5">
                    {TOP_NVIDIA_QUICK_MODELS.map((m) => {
                      const isSelected = activeProvider.defaultModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectModel("p-nvidia", m.id, m.name)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-[11px] transition-colors ${
                            isSelected
                              ? "bg-[#76B900]/20 text-[#76B900] font-semibold"
                              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          {isSelected && <Check className="h-3 w-3 text-[#76B900] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If OpenRouter is Active, Show Quick Free Models Switcher */}
              {isOpenRouter && activeProvider.status === "active" && (
                <div className="mt-2 pt-2 border-t border-border/60">
                  <div className="px-2 py-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Gift className="h-3 w-3" /> Quick Switch OpenRouter Model
                  </div>
                  <div className="space-y-0.5">
                    {TOP_OPENROUTER_QUICK_MODELS.map((m) => {
                      const isSelected = activeProvider.defaultModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectModel("p-openrouter", m.id, m.name)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-[11px] transition-colors ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          {isSelected && <Check className="h-3 w-3 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-border/60 mt-2 pt-1.5">
                <Link
                  href="/settings/ai-providers"
                  onClick={() => setShowProviderMenu(false)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Settings2 className="h-3.5 w-3.5" />
                    Configure Providers & Models
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
        <span className="flex items-center gap-1">
          Model:{" "}
          <strong className="text-foreground font-mono truncate max-w-[200px]">
            {activeProvider.defaultModel}
          </strong>
          {activeProvider.defaultModel?.includes(":free") && (
            <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded">
              100% FREE
            </span>
          )}
        </span>
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
            placeholder="e.g. GPU computing wonders, SaaS startup tips, product launch..."
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

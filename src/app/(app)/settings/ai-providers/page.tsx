"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sliders,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Trash2,
  ExternalLink,
  Check,
  ChevronDown,
  Search,
  RefreshCw,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMountedAIProviders,
  type AIProviderItem,
  type ModelPreset,
  OPENROUTER_FREE_MODELS,
  OPENROUTER_POPULAR_MODELS,
  OPENAI_POPULAR_MODELS,
  GEMINI_POPULAR_MODELS,
} from "@/hooks/use-ai-providers";

export default function AiProvidersSettingsPage() {
  const { providers, saveProvider, setDefaultProvider, disconnectProvider } =
    useMountedAIProviders();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderItem | null>(
    null
  );
  const [inputKey, setInputKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [inputBaseUrl, setInputBaseUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);

  // Model Selection Filter & Search State
  const [modelTab, setModelTab] = useState<"free" | "popular" | "all">("free");
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [liveModels, setLiveModels] = useState<ModelPreset[]>([]);
  const [isLoadingLiveModels, setIsLoadingLiveModels] = useState(false);

  const handleOpenConfig = (p: AIProviderItem) => {
    setSelectedProvider(p);
    setInputKey(p.apiKey || "");
    setSelectedModel(p.defaultModel);
    setInputBaseUrl(p.baseUrl || "");
    setShowCustomModelInput(false);
    setModelTab(p.id === "p-openrouter" ? "free" : "popular");
    setModelSearchQuery("");
    setModalOpen(true);
  };

  const fetchLiveOpenRouterModels = async () => {
    setIsLoadingLiveModels(true);
    try {
      const res = await fetch("/api/ai/models?free=false");
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: ModelPreset[] = data.models.map((m: any) => {
          const isFree =
            m.id.endsWith(":free") ||
            (parseFloat(m.pricing?.prompt || "1") === 0 &&
              parseFloat(m.pricing?.completion || "1") === 0);
          return {
            id: m.id,
            name: m.name,
            badge: isFree ? "100% Free" : "Standard",
            desc: m.description || `Context: ${m.context_length?.toLocaleString() || "N/A"} tokens`,
            isFree,
            context: m.context_length ? `${(m.context_length / 1000).toFixed(0)}k` : undefined,
          };
        });
        setLiveModels(mapped);
        toast.success(`Loaded ${mapped.length} live OpenRouter models!`);
      }
    } catch {
      toast.error("Could not fetch live OpenRouter models. Using pre-loaded models.");
    } finally {
      setIsLoadingLiveModels(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedProvider) return;

    if (selectedProvider.providerType !== "free_default" && !inputKey.trim()) {
      toast.error("Please enter a valid API secret key.");
      return;
    }

    if (selectedProvider.providerType === "custom" && !inputBaseUrl.trim()) {
      toast.error("Please enter the Base URL for your custom endpoint.");
      return;
    }

    setIsTesting(true);

    try {
      const res = await fetch("/api/ai/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: selectedProvider.providerType,
          apiKey: inputKey.trim(),
          model: selectedModel.trim(),
          baseUrl: inputBaseUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          data.error || `Failed to verify credentials for ${selectedProvider.name}`
        );
        return;
      }

      saveProvider({
        id: selectedProvider.id,
        apiKey: inputKey.trim(),
        model: selectedModel.trim(),
        baseUrl: inputBaseUrl.trim() || undefined,
        latency: data.latency || "180ms",
      });

      setModalOpen(false);
      toast.success(
        `Connection to ${selectedProvider.name} verified & active! (${data.latency || "OK"})`
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Network error testing provider"
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSetDefault = (providerId: string) => {
    setDefaultProvider(providerId);
    toast.success("Default AI provider updated!");
  };

  const handleDisconnect = (p: AIProviderItem) => {
    disconnectProvider(p.id);
    toast.success(`${p.name} disconnected`);
  };

  // Filtered models for the config modal
  const displayedModels = useMemo(() => {
    if (!selectedProvider) return [];

    let list: ModelPreset[] = [];

    if (selectedProvider.providerType === "openrouter") {
      if (liveModels.length > 0) {
        list =
          modelTab === "free"
            ? liveModels.filter((m) => m.isFree)
            : modelTab === "popular"
            ? [...OPENROUTER_POPULAR_MODELS, ...liveModels.filter((m) => !m.isFree).slice(0, 15)]
            : liveModels;
      } else {
        list =
          modelTab === "free"
            ? OPENROUTER_FREE_MODELS
            : modelTab === "popular"
            ? OPENROUTER_POPULAR_MODELS
            : [...OPENROUTER_FREE_MODELS, ...OPENROUTER_POPULAR_MODELS];
      }
    } else if (selectedProvider.providerType === "openai") {
      list = OPENAI_POPULAR_MODELS;
    } else if (selectedProvider.providerType === "gemini") {
      list = GEMINI_POPULAR_MODELS;
    }

    if (modelSearchQuery.trim()) {
      const q = modelSearchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q) ||
          (m.badge && m.badge.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedProvider, modelTab, modelSearchQuery, liveModels]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            AI Provider Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure BYO AI models (OpenRouter with 20+ Free Models, OpenAI, Gemini) or use our free built-in quota.
          </p>
        </div>
      </div>

      {/* Quota Overview Card */}
      <Card glass className="border-primary/20 bg-gradient-to-br from-card/80 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">
                  Free OpenRouter Models & Unlimited BYO Key
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect OpenRouter to access free models like <strong>Z.ai GLM 5.2 (Free)</strong>, <strong>MiniMax M3 (Free)</strong>, <strong>Nemotron 3.5 Lightning (Free)</strong>, and <strong>Gemma 4 (Free)</strong> at $0 cost with zero monthly limits!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-foreground">12</span>
                <span className="text-sm text-muted-foreground"> / 20 built-in used</span>
              </div>
              <div className="h-10 w-24 bg-muted/60 rounded-full overflow-hidden p-1 border border-border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((p) => {
          const isActive = p.status === "active";
          const isBYO = p.type === "BYO Key";
          const isFreeModel = p.defaultModel?.includes(":free");

          return (
            <Card
              key={p.id}
              glass
              className={`transition-all duration-200 ${
                p.isDefault
                  ? "border-primary/60 shadow-md ring-1 ring-primary/20"
                  : "border-border/80"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        p.id === "p-openrouter"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                          : p.id === "p-openai"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : p.id === "p-gemini"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          : "bg-primary/15 text-primary border border-primary/20"
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        {p.name}
                        {p.id === "p-openrouter" && (
                          <Badge variant="brand" className="text-[9px] py-0 px-1.5 bg-purple-500/20 text-purple-300 border-purple-500/30">
                            20+ Free Models
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground">{p.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isDefault && (
                      <Badge variant="brand" className="text-[10px]">
                        Default
                      </Badge>
                    )}
                    {isActive ? (
                      <Badge variant="success" dot className="text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Not Set
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/50 bg-card/40 p-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Selected Model:</span>
                    <span className="font-mono text-foreground font-medium truncate max-w-[200px] flex items-center gap-1" title={p.defaultModel}>
                      {p.defaultModel}
                      {isFreeModel && (
                        <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-400 px-1 rounded">
                          FREE
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Key Status:</span>
                    <span className="font-mono text-foreground">{p.apiKeyMasked}</span>
                  </div>
                  {p.latency && (
                    <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                      <span>Latency:</span>
                      <span className="text-success font-medium">{p.latency}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1.5"
                    onClick={() => handleOpenConfig(p)}
                  >
                    <Sliders className="h-3 w-3" />
                    {isActive ? "Configure / Change Model" : "Add API Key"}
                  </Button>

                  {isActive && !p.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => handleSetDefault(p.id)}
                    >
                      Set Default
                    </Button>
                  )}

                  {isBYO && isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
                      onClick={() => handleDisconnect(p)}
                      title="Remove API Key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Zero markup on BYO API keys:</span>{" "}
          SocialHub connects directly to OpenRouter, OpenAI, and Gemini. API tokens are stored in your secure workspace storage and never exposed to 3rd parties.
        </div>
      </div>

      {/* Provider Config Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Configure {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider?.id === "p-openrouter"
                ? "Select from 20+ Free OpenRouter models ($0 cost) or flagship models (Claude 3.5, GPT-4o, DeepSeek)."
                : `Enter your ${selectedProvider?.name} credentials to enable direct model routing.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
            {/* API Key Input */}
            {selectedProvider?.providerType !== "free_default" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="apiKeyInput">API Secret Key</Label>
                  {selectedProvider?.id === "p-openrouter" && (
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get free OpenRouter key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedProvider?.id === "p-openai" && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get OpenAI key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedProvider?.id === "p-gemini" && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get Gemini key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Input
                  id="apiKeyInput"
                  type="password"
                  placeholder={
                    selectedProvider?.id === "p-openrouter"
                      ? "sk-or-v1-..."
                      : selectedProvider?.id === "p-openai"
                      ? "sk-proj-..."
                      : "AIzaSy..."
                  }
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  leftIcon={<Key className="h-4 w-4" />}
                  autoFocus
                />
              </div>
            )}

            {/* Model Selection with Categories & Search */}
            {selectedProvider && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="modelInput">Select Model</Label>

                  {selectedProvider.id === "p-openrouter" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] px-2 text-primary"
                      onClick={fetchLiveOpenRouterModels}
                      isLoading={isLoadingLiveModels}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync All OpenRouter Models
                    </Button>
                  )}
                </div>

                {/* OpenRouter Filter Tabs */}
                {selectedProvider.id === "p-openrouter" && (
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <button
                      type="button"
                      onClick={() => setModelTab("free")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        modelTab === "free"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "text-muted-foreground hover:bg-accent/40"
                      }`}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      100% Free Models ({OPENROUTER_FREE_MODELS.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setModelTab("popular")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        modelTab === "popular"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : "text-muted-foreground hover:bg-accent/40"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Popular / Flagship
                    </button>

                    <button
                      type="button"
                      onClick={() => setModelTab("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        modelTab === "all"
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-accent/40"
                      }`}
                    >
                      All Models
                    </button>
                  </div>
                )}

                {/* Model Search Box */}
                <div className="relative">
                  <Input
                    placeholder="Search models by name, ID (e.g. glm, nemotron, gemma, claude, deepseek)..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Models List */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 border border-border/40 rounded-xl p-1.5 bg-card/20">
                  {displayedModels.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No models found matching &quot;{modelSearchQuery}&quot;. You can type a custom model ID below.
                    </div>
                  ) : (
                    displayedModels.map((preset) => {
                      const isSelected = selectedModel === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(preset.id);
                            setShowCustomModelInput(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40"
                              : "border-border/50 hover:bg-accent/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground truncate">
                                {preset.name}
                              </span>
                              {preset.badge && (
                                <Badge
                                  variant={preset.isFree ? "success" : "secondary"}
                                  className="text-[9px] py-0 px-1.5 font-bold"
                                >
                                  {preset.badge}
                                </Badge>
                              )}
                              {preset.context && (
                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1 rounded font-mono">
                                  {preset.context} context
                                </span>
                              )}
                              {preset.speed && (
                                <span className="text-[10px] text-emerald-400/90 font-mono">
                                  ⚡ {preset.speed}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] text-muted-foreground/90 font-mono truncate max-w-[280px]">
                                {preset.id}
                              </span>
                              {preset.desc && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[220px] hidden sm:inline">
                                  {preset.desc}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomModelInput(!showCustomModelInput)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {showCustomModelInput
                      ? "Hide custom model input"
                      : "+ Enter a custom model ID manually"}
                  </button>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    Selected: <strong className="text-foreground">{selectedModel || "None"}</strong>
                  </span>
                </div>

                {showCustomModelInput && (
                  <Input
                    id="modelInput"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder="e.g. z-ai/glm-5.2:free or inclusionai/ling-3.0-flash-fin:free"
                    className="font-mono text-xs mt-1"
                  />
                )}
              </div>
            )}

            {/* Custom Base URL */}
            {selectedProvider?.providerType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="baseUrlInput">Custom Base URL</Label>
                <Input
                  id="baseUrlInput"
                  value={inputBaseUrl}
                  onChange={(e) => setInputBaseUrl(e.target.value)}
                  placeholder="https://api.together.xyz/v1"
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/40 pt-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" isLoading={isTesting} onClick={handleSaveConfig}>
              Test & Save Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

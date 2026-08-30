"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Zap,
  ShieldCheck,
  Cpu,
  Trash2,
  ExternalLink,
  Check,
  Search,
  RefreshCw,
  Gift,
  Radio,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  NVIDIA_POPULAR_MODELS,
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

  // Verification State
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testResult, setTestResult] = useState<{
    latency?: string;
    message?: string;
    error?: string;
  } | null>(null);

  // Model Selection Filter & Search
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
    setTestStatus(p.status === "active" && p.apiKey ? "success" : "idle");
    setTestResult(
      p.latency
        ? { latency: p.latency, message: `Active with latency ${p.latency}` }
        : null
    );
    setModalOpen(true);
  };

  const handleKeyChange = (val: string) => {
    setInputKey(val);
    setTestStatus("idle");
    setTestResult(null);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setTestStatus("idle");
    setTestResult(null);
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
            badge: isFree ? "Free" : "Standard",
            desc: m.description || `Context: ${m.context_length?.toLocaleString() || "N/A"} tokens`,
            isFree,
            context: m.context_length ? `${Math.round(m.context_length / 1000)}k` : undefined,
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

  // Step 1: Run Connection Test
  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    if (selectedProvider.providerType !== "free_default" && !inputKey.trim()) {
      toast.error("Please enter your API key first.");
      return;
    }

    if (selectedProvider.providerType === "custom" && !inputBaseUrl.trim()) {
      toast.error("Please enter the Base URL for your custom endpoint.");
      return;
    }

    setIsTesting(true);
    setTestStatus("testing");
    setTestResult(null);

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
        const errorMsg =
          data.error || `Failed to verify credentials for ${selectedProvider.name}`;
        setTestStatus("error");
        setTestResult({ error: errorMsg });
        toast.error(errorMsg);
        return;
      }

      setTestStatus("success");
      setTestResult({
        latency: data.latency || "160ms",
        message: `Connected successfully (${data.latency})`,
      });
      toast.success(`Verified connection in ${data.latency || "160ms"}`);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error testing provider";
      setTestStatus("error");
      setTestResult({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  // Step 2: Save Verified Config
  const handleSaveVerifiedConfig = () => {
    if (!selectedProvider) return;

    saveProvider({
      id: selectedProvider.id,
      apiKey: inputKey.trim(),
      model: selectedModel.trim(),
      baseUrl: inputBaseUrl.trim() || undefined,
      latency: testResult?.latency || "160ms",
    });

    setModalOpen(false);
    toast.success(
      `${selectedProvider.name} (${selectedModel}) saved and active`
    );
  };

  const handleSetDefault = (providerId: string) => {
    setDefaultProvider(providerId);
    toast.success("Default provider updated");
  };

  const handleDisconnect = (p: AIProviderItem) => {
    disconnectProvider(p.id);
    toast.success(`${p.name} disconnected`);
  };

  // Filtered models for the config modal
  const displayedModels = useMemo(() => {
    if (!selectedProvider) return [];

    let list: ModelPreset[] = [];

    if (selectedProvider.providerType === "nvidia") {
      list = NVIDIA_POPULAR_MODELS;
    } else if (selectedProvider.providerType === "openrouter") {
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
          (m.badge && m.badge.toLowerCase().includes(q)) ||
          (m.speed && m.speed.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedProvider, modelTab, modelSearchQuery, liveModels]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          AI Providers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect NVIDIA NIM, OpenRouter, OpenAI, or Gemini for direct model execution with zero markup.
        </p>
      </div>

      {/* Overview Card */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              Direct BYO Model Routing Active
            </div>
            <div className="text-xs text-muted-foreground">
              API requests run directly against your connected models with custom rate limits.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-sm font-semibold text-foreground">12</span>
            <span className="text-xs text-muted-foreground"> / 20 free tier used</span>
          </div>
          <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => {
          const isActive = p.status === "active";
          const isBYO = p.type === "BYO Key";
          const isFreeModel = p.defaultModel?.includes(":free");

          return (
            <Card
              key={p.id}
              className={`transition-all ${
                p.isDefault
                  ? "border-primary/50 ring-1 ring-primary/20 bg-card/90"
                  : "border-border/70 bg-card/50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        p.id === "p-nvidia"
                          ? "bg-[#76B900]/15 text-[#76B900]"
                          : p.id === "p-openrouter"
                          ? "bg-purple-500/15 text-purple-400"
                          : p.id === "p-openai"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : p.id === "p-gemini"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        {p.name}
                        {p.id === "p-openrouter" && (
                          <span className="text-[10px] font-normal text-purple-400">
                            (Free Models)
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">{p.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.isDefault && (
                      <Badge variant="brand" className="text-[10px] py-0 px-1.5">
                        Default
                      </Badge>
                    )}
                    {isActive ? (
                      <Badge variant="success" dot className="text-[10px] py-0 px-1.5">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        Not Set
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Model</span>
                    <span className="font-mono text-foreground font-medium truncate max-w-[210px] flex items-center gap-1">
                      {p.defaultModel}
                      {isFreeModel && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                          Free
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Key</span>
                    <span className="font-mono text-foreground">{p.apiKeyMasked}</span>
                  </div>
                  {p.latency && (
                    <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                      <span>Latency</span>
                      <span className="text-emerald-400 font-mono font-medium">{p.latency}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1.5"
                    onClick={() => handleOpenConfig(p)}
                  >
                    <Sliders className="h-3 w-3" />
                    {isActive ? "Configure" : "Connect Key"}
                  </Button>

                  {isActive && !p.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSetDefault(p.id)}
                    >
                      Set Default
                    </Button>
                  )}

                  {isBYO && isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-muted-foreground hover:text-destructive px-2"
                      onClick={() => handleDisconnect(p)}
                      title="Disconnect"
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

      {/* Security Note */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-3.5 flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <div>
          Keys are stored in your secure workspace storage and routed directly to model endpoints.
        </div>
      </div>

      {/* Distilled Config Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-5 gap-4">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              Configure {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedProvider?.id === "p-nvidia"
                ? "Connect NVIDIA NIM with Moonshot Kimi K3, Llama 3.3 70B, or Nemotron."
                : selectedProvider?.id === "p-openrouter"
                ? "Select from 20+ Free OpenRouter models ($0 cost) or flagship models."
                : `Enter your ${selectedProvider?.name} API key to enable direct routing.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
            {/* API Key Input */}
            {selectedProvider?.providerType !== "free_default" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="apiKeyInput" className="text-xs font-medium">
                    API Secret Key
                  </Label>
                  {selectedProvider?.id === "p-nvidia" && (
                    <a
                      href="https://build.nvidia.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#76B900] hover:underline flex items-center gap-1"
                    >
                      Get NGC key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedProvider?.id === "p-openrouter" && (
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedProvider?.id === "p-openai" && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedProvider?.id === "p-gemini" && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Get key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Input
                  id="apiKeyInput"
                  type="password"
                  placeholder={
                    selectedProvider?.id === "p-nvidia"
                      ? "nvapi-..."
                      : selectedProvider?.id === "p-openrouter"
                      ? "sk-or-v1-..."
                      : "sk-..."
                  }
                  value={inputKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  leftIcon={<Key className="h-3.5 w-3.5 text-muted-foreground" />}
                  className="h-9 text-xs font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Model Selection */}
            {selectedProvider && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Select Model</Label>
                  {selectedProvider.id === "p-openrouter" && (
                    <button
                      type="button"
                      onClick={fetchLiveOpenRouterModels}
                      disabled={isLoadingLiveModels}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingLiveModels ? "animate-spin" : ""}`} />
                      Sync Live Models
                    </button>
                  )}
                </div>

                {/* OpenRouter Segmented Filter Tabs */}
                {selectedProvider.id === "p-openrouter" && (
                  <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/50 text-xs">
                    <button
                      type="button"
                      onClick={() => setModelTab("free")}
                      className={`flex-1 py-1 px-2 rounded-md font-medium text-xs transition-all ${
                        modelTab === "free"
                          ? "bg-card text-emerald-400 shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Free ({OPENROUTER_FREE_MODELS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelTab("popular")}
                      className={`flex-1 py-1 px-2 rounded-md font-medium text-xs transition-all ${
                        modelTab === "popular"
                          ? "bg-card text-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Flagship
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelTab("all")}
                      className={`flex-1 py-1 px-2 rounded-md font-medium text-xs transition-all ${
                        modelTab === "all"
                          ? "bg-card text-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Input
                    placeholder="Filter models by name or ID..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Distilled Model Items */}
                <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5 rounded-lg border border-border/50 bg-muted/10 p-1">
                  {displayedModels.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No models matching &quot;{modelSearchQuery}&quot;
                    </div>
                  ) : (
                    displayedModels.map((preset) => {
                      const isSelected = selectedModel === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            handleModelChange(preset.id);
                            setShowCustomModelInput(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-all ${
                            isSelected
                              ? "bg-primary/10 border border-primary/40 text-foreground"
                              : "border border-transparent hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-foreground truncate">
                                {preset.name}
                              </span>
                              {preset.isFree && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                                  Free
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">
                              {preset.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {preset.context && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {preset.context}
                              </span>
                            )}
                            {preset.speed && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                {preset.speed}
                              </span>
                            )}
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowCustomModelInput(!showCustomModelInput)}
                    className="text-primary hover:underline text-[11px]"
                  >
                    {showCustomModelInput ? "Hide custom ID" : "+ Enter custom model ID"}
                  </button>

                  <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                    {selectedModel}
                  </span>
                </div>

                {showCustomModelInput && (
                  <Input
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    placeholder="e.g. moonshotai/kimi-k3 or meta-llama/llama-3.3-70b-instruct:free"
                    className="font-mono text-xs h-8 mt-1"
                  />
                )}
              </div>
            )}

            {/* Custom Base URL */}
            {selectedProvider?.providerType === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="baseUrlInput" className="text-xs font-medium">Custom Base URL</Label>
                <Input
                  id="baseUrlInput"
                  value={inputBaseUrl}
                  onChange={(e) => {
                    setInputBaseUrl(e.target.value);
                    setTestStatus("idle");
                  }}
                  placeholder="https://integrate.api.nvidia.com/v1"
                  className="h-8 text-xs font-mono"
                />
              </div>
            )}

            {/* Inline Verification Status */}
            {testStatus === "success" && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 flex items-center justify-between text-xs animate-in fade-in-50">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Connection verified ({testResult?.latency})</span>
                </div>
                <span className="text-[11px] text-emerald-300/80 font-mono truncate max-w-[140px]">
                  {selectedModel}
                </span>
              </div>
            )}

            {testStatus === "error" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 flex items-start gap-2 text-xs text-destructive animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-medium">Verification Failed</div>
                  <div className="text-[11px] opacity-90 truncate">
                    {testResult?.error || "Could not authenticate."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Distilled Footer */}
          <DialogFooter className="border-t border-border/40 pt-3 flex items-center justify-between gap-2 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={testStatus === "success" ? "outline" : "brand"}
                size="sm"
                isLoading={isTesting}
                onClick={handleTestConnection}
                className="text-xs h-8 gap-1.5"
              >
                <Zap className="h-3 w-3" />
                {testStatus === "success" ? "Test Again" : "Test Connection"}
              </Button>

              {testStatus === "success" && (
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={handleSaveVerifiedConfig}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1.5 animate-in fade-in-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save & Activate
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

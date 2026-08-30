"use client";

import { useState } from "react";
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
  useAIProvidersStore,
  type AIProviderItem,
  OPENROUTER_POPULAR_MODELS,
  OPENAI_POPULAR_MODELS,
  GEMINI_POPULAR_MODELS,
} from "@/hooks/use-ai-providers";

export default function AiProvidersSettingsPage() {
  const { providers, saveProvider, setDefaultProvider, disconnectProvider } =
    useAIProvidersStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderItem | null>(
    null
  );
  const [inputKey, setInputKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [inputBaseUrl, setInputBaseUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);

  const handleOpenConfig = (p: AIProviderItem) => {
    setSelectedProvider(p);
    setInputKey(p.apiKey || "");
    setSelectedModel(p.defaultModel);
    setInputBaseUrl(p.baseUrl || "");
    setShowCustomModelInput(false);
    setModalOpen(true);
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

  const getModelPresets = (providerType: string) => {
    switch (providerType) {
      case "openrouter":
        return OPENROUTER_POPULAR_MODELS;
      case "openai":
        return OPENAI_POPULAR_MODELS;
      case "gemini":
        return GEMINI_POPULAR_MODELS;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            AI Provider Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure BYO AI models (OpenRouter, OpenAI, Gemini) or use our free built-in quota.
          </p>
        </div>
      </div>

      {/* Quota Overview Card */}
      <Card glass className="border-primary/20 bg-gradient-to-br from-card/80 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  AI Generation Quotas & BYO Key
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                BYO API keys (OpenRouter, Gemini, OpenAI) bypass all platform limits with zero markup and unlimited generations.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-foreground">12</span>
                <span className="text-sm text-muted-foreground"> / 20 free used</span>
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
                          <Badge variant="brand" className="text-[9px] py-0 px-1.5">
                            Multi-Model
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
                    <span>Default Model:</span>
                    <span className="font-mono text-foreground font-medium truncate max-w-[200px]" title={p.defaultModel}>
                      {p.defaultModel}
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
                    {isActive ? "Configure" : "Add API Key"}
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configure {selectedProvider?.name}
          </DialogTitle>
          <DialogDescription>
            {selectedProvider?.id === "p-openrouter"
              ? "Connect your OpenRouter account to access Claude 3.5 Sonnet, DeepSeek V3, GPT-4o, and hundreds of models."
              : `Enter your ${selectedProvider?.name} credentials to enable direct model routing.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                    Get OpenRouter key <ExternalLink className="h-3 w-3" />
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

          {/* Model Presets & Selection */}
          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="modelInput">Selected Model</Label>

              {getModelPresets(selectedProvider.providerType).length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {getModelPresets(selectedProvider.providerType).map((preset) => {
                      const isSelected = selectedModel === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(preset.id);
                            setShowCustomModelInput(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/60 hover:bg-accent/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              {preset.name}
                              <Badge
                                variant={preset.badge === "Recommended" ? "brand" : "secondary"}
                                className="text-[9px] py-0 px-1"
                              >
                                {preset.badge}
                              </Badge>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {preset.id}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomModelInput(!showCustomModelInput)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {showCustomModelInput
                        ? "Hide custom model ID"
                        : "+ Enter a custom model ID"}
                    </button>
                  </div>
                </div>
              )}

              {(showCustomModelInput ||
                getModelPresets(selectedProvider.providerType).length === 0) && (
                <Input
                  id="modelInput"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g. anthropic/claude-3.5-sonnet or deepseek/deepseek-chat"
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="brand" isLoading={isTesting} onClick={handleSaveConfig}>
            Test & Save Provider
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

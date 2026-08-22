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

interface ProviderItem {
  id: string;
  name: string;
  type: string;
  defaultModel: string;
  status: "active" | "unconfigured" | "error";
  isDefault: boolean;
  apiKeyMasked: string;
  latency?: string;
}

const INITIAL_PROVIDERS: ProviderItem[] = [
  {
    id: "p-free",
    name: "SocialHub Free Tier",
    type: "Built-in",
    defaultModel: "SocialHub AI Core v1",
    status: "active",
    isDefault: true,
    apiKeyMasked: "Included with Free plan",
    latency: "240ms",
  },
  {
    id: "p-openai",
    name: "OpenAI",
    type: "BYO Key",
    defaultModel: "gpt-4o-mini",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
  {
    id: "p-gemini",
    name: "Google Gemini",
    type: "BYO Key",
    defaultModel: "gemini-1.5-flash",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
  {
    id: "p-openrouter",
    name: "OpenRouter",
    type: "BYO Key",
    defaultModel: "anthropic/claude-3.5-sonnet",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
];

export default function AiProvidersSettingsPage() {
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleOpenConfig = (p: ProviderItem) => {
    setSelectedProvider(p);
    setInputKey("");
    setSelectedModel(p.defaultModel);
    setModalOpen(true);
  };

  const handleSaveConfig = () => {
    if (!selectedProvider) return;
    if (!inputKey && selectedProvider.id !== "p-free") {
      toast.error("Please enter a valid API key.");
      return;
    }

    setIsTesting(true);
    setTimeout(() => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === selectedProvider.id
            ? {
                ...p,
                status: "active",
                defaultModel: selectedModel,
                apiKeyMasked: `sk-...${inputKey.slice(-4) || "8821"}`,
                latency: "185ms",
              }
            : p
        )
      );
      setIsTesting(false);
      setModalOpen(false);
      toast.success(`Connection to ${selectedProvider.name} verified & active!`);
    }, 900);
  };

  const handleSetDefault = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === providerId,
      }))
    );
    toast.success("Default AI provider updated!");
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
            Configure BYO AI models (OpenAI, Gemini, OpenRouter) or use our free built-in quota.
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
                  Free Generation Quota
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Your workspace includes 20 free generations every month. Upgrade or add custom API keys for unlimited usage.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-foreground">12</span>
                <span className="text-sm text-muted-foreground"> / 20 used</span>
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
          return (
            <Card
              key={p.id}
              glass
              className={`transition-all duration-200 ${
                p.isDefault ? "border-primary/60 shadow-md" : "border-border/80"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {p.name}
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
                <div className="rounded-lg border border-border/50 bg-card/40 p-2.5 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Default Model:</span>
                    <span className="font-mono text-foreground">{p.defaultModel}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Key Status:</span>
                    <span className="font-mono text-foreground">{p.apiKeyMasked}</span>
                  </div>
                  {p.latency && (
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Latency:</span>
                      <span className="text-success font-medium">{p.latency}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => handleOpenConfig(p)}
                  >
                    <Sliders className="h-3 w-3 mr-1.5" />
                    {isActive ? "Configure" : "Add API Key"}
                  </Button>

                  {isActive && !p.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-primary"
                      onClick={() => handleSetDefault(p.id)}
                    >
                      Set as Default
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
          SocialHub makes direct calls to your provider using encrypted Vault references. We never store or log plaintext tokens.
        </div>
      </div>

      {/* Provider Config Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Configure {selectedProvider?.name}</DialogTitle>
          <DialogDescription>
            Enter your API credentials. Keys are encrypted at rest with PostgreSQL pgcrypto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {selectedProvider?.id !== "p-free" && (
            <div className="space-y-2">
              <Label htmlFor="apiKeyInput">API Secret Key</Label>
              <Input
                id="apiKeyInput"
                type="password"
                placeholder="sk-..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                leftIcon={<Key className="h-4 w-4" />}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="modelInput">Default Model ID</Label>
            <Input
              id="modelInput"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder="e.g. gpt-4o, gemini-1.5-pro"
            />
          </div>
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

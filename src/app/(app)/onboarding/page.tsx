"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Building2,
  Share2,
  Key,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createWorkspace } from "@/lib/actions/workspace";
import { useWorkspaceStore } from "@/hooks/use-workspace";

const STEPS = [
  { id: 1, title: "Workspace", icon: Building2 },
  { id: 2, title: "Platforms", icon: Share2 },
  { id: 3, title: "AI Setup", icon: Key },
];

const PLATFORMS = [
  { id: "instagram", name: "Instagram", desc: "Reels, Stories, Feed", color: "from-pink-500 to-amber-500" },
  { id: "twitter", name: "X (Twitter)", desc: "Tweets, Threads, Media", color: "bg-neutral-900" },
  { id: "linkedin", name: "LinkedIn", desc: "Articles, Posts, Documents", color: "bg-[#0A66C2]" },
  { id: "facebook", name: "Facebook", desc: "Pages, Groups, Stories", color: "bg-[#1877F2]" },
  { id: "tiktok", name: "TikTok", desc: "Short-form video", color: "bg-neutral-900" },
  { id: "youtube", name: "YouTube", desc: "Shorts, Video community", color: "bg-[#FF0000]" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "twitter",
  ]);
  const [aiProvider, setAiProvider] = useState<"free_default" | "custom">("free_default");
  const [customKey, setCustomKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setCurrentWorkspace } = useWorkspaceStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWorkspaceName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (!workspaceName) {
      toast.error("Please provide a workspace name.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", workspaceName);
      formData.set("slug", slug);

      const res = await createWorkspace(formData);
      if (res.error) {
        toast.error(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.workspace) {
        setCurrentWorkspace({
          ...res.workspace,
          role: "owner",
        });
      }

      toast.success("Workspace created! Welcome to SocialHub.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] -z-10 blur-3xl opacity-25 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.20 268) 0%, oklch(0.40 0.15 280) 60%, transparent 80%)",
        }}
      />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur mb-4">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Quick Setup (1 minute)
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome to SocialHub
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Let&apos;s get your first workspace configured so you can start creating.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-4 max-w-md mx-auto">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-success text-success-foreground shadow-md shadow-success/20"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] w-16 sm:w-24 mx-2 transition-colors ${
                      isCompleted ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Workspace creation */}
        {currentStep === 1 && (
          <Card glass className="shadow-2xl">
            <CardHeader>
              <CardTitle>Name your workspace</CardTitle>
              <CardDescription>
                Workspaces keep your accounts, posts, team members, and settings isolated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wsName">Workspace Name</Label>
                <Input
                  id="wsName"
                  placeholder="e.g. Acme Marketing, Personal Brand"
                  value={workspaceName}
                  onChange={handleNameChange}
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wsSlug">Workspace URL Slug</Label>
                <div className="flex items-center rounded-lg border border-input bg-card/30 px-3 py-2 text-sm text-muted-foreground">
                  <span className="opacity-70">app.socialhub.com/</span>
                  <span className="font-semibold text-foreground ml-1">
                    {slug || "workspace-slug"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button
                variant="brand"
                onClick={() => {
                  if (!workspaceName.trim()) {
                    toast.error("Please enter a workspace name.");
                    return;
                  }
                  setCurrentStep(2);
                }}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Select Platforms */}
        {currentStep === 2 && (
          <Card glass className="shadow-2xl">
            <CardHeader>
              <CardTitle>Which platforms do you publish to?</CardTitle>
              <CardDescription>
                Select the channels you manage. You can connect your actual accounts later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card/40 hover:bg-card hover:border-border/80"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${
                          p.color.startsWith("bg-") ? p.color : `bg-gradient-to-r ${p.color}`
                        }`}
                      >
                        <Share2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{p.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button variant="brand" onClick={() => setCurrentStep(3)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: AI Provider Setup */}
        {currentStep === 3 && (
          <Card glass className="shadow-2xl">
            <CardHeader>
              <CardTitle>AI Assistant Setup</CardTitle>
              <CardDescription>
                SocialHub is provider-agnostic. Choose how you want to power caption and reply generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setAiProvider("free_default")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    aiProvider === "free_default"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/40 hover:bg-card"
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        Use SocialHub Free Tier
                      </p>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-success/20 text-success">
                        Included
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      20 free AI generations per month. Zero configuration required.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider("custom")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    aiProvider === "custom"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/40 hover:bg-card"
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-foreground shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Bring Your Own API Key (OpenAI, Gemini, OpenRouter)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlimited generations at direct provider cost. Set up anytime in Settings.
                    </p>
                  </div>
                </button>
              </div>

              {aiProvider === "custom" && (
                <div className="space-y-2 pt-2 animate-in fade-in-50">
                  <Label htmlFor="customKey">API Key (Optional now, can add later)</Label>
                  <Input
                    id="customKey"
                    type="password"
                    placeholder="sk-..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Keys are stored securely and never exposed in client bundles.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button
                variant="brand"
                isLoading={isSubmitting}
                onClick={handleFinish}
              >
                Finish & Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

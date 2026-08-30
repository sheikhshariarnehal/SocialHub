"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIProviderItem {
  id: string;
  name: string;
  type: "Built-in" | "BYO Key";
  providerType: "free_default" | "openai" | "gemini" | "openrouter" | "custom";
  defaultModel: string;
  status: "active" | "unconfigured" | "error";
  isDefault: boolean;
  apiKey?: string;
  apiKeyMasked: string;
  latency?: string;
  baseUrl?: string;
}

export const OPENROUTER_POPULAR_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", badge: "Recommended", desc: "Highest quality copywriting & tone match" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", badge: "Fast", desc: "Ultra-fast generation & low cost" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", badge: "High Value", desc: "State-of-the-art capability at extreme affordability" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", badge: "Reasoning", desc: "Advanced reasoning for complex thought leadership" },
  { id: "openai/gpt-4o", name: "OpenAI GPT-4o", badge: "Flagship", desc: "Versatile, high-precision content" },
  { id: "openai/gpt-4o-mini", name: "OpenAI GPT-4o Mini", badge: "Lightweight", desc: "Fast & cost-effective" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", badge: "Next-Gen", desc: "Ultra low latency & high speed" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", badge: "Open Source", desc: "Meta's flagship open weight model" },
  { id: "mistralai/mistral-large-2407", name: "Mistral Large", badge: "Power", desc: "Top European open weights model" },
];

export const OPENAI_POPULAR_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", badge: "Recommended", desc: "Fast, smart, and lightweight" },
  { id: "gpt-4o", name: "GPT-4o", badge: "Flagship", desc: "High performance multimodal model" },
  { id: "o3-mini", name: "o3-mini", badge: "Reasoning", desc: "High-reasoning model for technical content" },
];

export const GEMINI_POPULAR_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", badge: "Recommended", desc: "Fast, multimodal and lightweight" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", badge: "Pro", desc: "High depth and large context window" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: "Next-Gen", desc: "Next-generation low-latency model" },
];

export const INITIAL_AI_PROVIDERS: AIProviderItem[] = [
  {
    id: "p-free",
    name: "SocialHub Free Tier",
    type: "Built-in",
    providerType: "free_default",
    defaultModel: "SocialHub AI Core v1",
    status: "active",
    isDefault: true,
    apiKeyMasked: "Included with Free plan",
    latency: "240ms",
  },
  {
    id: "p-openrouter",
    name: "OpenRouter",
    type: "BYO Key",
    providerType: "openrouter",
    defaultModel: "anthropic/claude-3.5-sonnet",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
  {
    id: "p-openai",
    name: "OpenAI",
    type: "BYO Key",
    providerType: "openai",
    defaultModel: "gpt-4o-mini",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
  {
    id: "p-gemini",
    name: "Google Gemini",
    type: "BYO Key",
    providerType: "gemini",
    defaultModel: "gemini-1.5-flash",
    status: "unconfigured",
    isDefault: false,
    apiKeyMasked: "Not configured",
  },
];

interface AIProvidersState {
  providers: AIProviderItem[];
  saveProvider: (params: {
    id: string;
    apiKey: string;
    model: string;
    baseUrl?: string;
    latency?: string;
  }) => void;
  setDefaultProvider: (id: string) => void;
  disconnectProvider: (id: string) => void;
  getActiveProvider: () => AIProviderItem;
}

export const useAIProvidersStore = create<AIProvidersState>()(
  persist(
    (set, get) => ({
      providers: INITIAL_AI_PROVIDERS,

      saveProvider: ({ id, apiKey, model, baseUrl, latency }) => {
        set((state) => {
          const updated = state.providers.map((p) => {
            if (p.id === id) {
              const masked =
                apiKey.length > 8
                  ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
                  : "••••••••";
              return {
                ...p,
                status: "active" as const,
                apiKey,
                apiKeyMasked: masked,
                defaultModel: model,
                baseUrl,
                latency: latency || "180ms",
              };
            }
            return p;
          });

          // If the user just configured this provider and no other BYO key is default, make it default
          const defaultExists = updated.some((p) => p.isDefault && p.id !== "p-free");
          if (!defaultExists) {
            return {
              providers: updated.map((p) => ({
                ...p,
                isDefault: p.id === id,
              })),
            };
          }

          return { providers: updated };
        });
      },

      setDefaultProvider: (id: string) => {
        set((state) => ({
          providers: state.providers.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        }));
      },

      disconnectProvider: (id: string) => {
        set((state) => {
          const updated = state.providers.map((p) => {
            if (p.id === id) {
              const initial = INITIAL_AI_PROVIDERS.find((init) => init.id === id);
              return {
                ...p,
                status: "unconfigured" as const,
                apiKey: undefined,
                apiKeyMasked: "Not configured",
                latency: undefined,
                isDefault: false,
                defaultModel: initial?.defaultModel || p.defaultModel,
              };
            }
            return p;
          });

          // Ensure at least free tier is default if default was removed
          const hasDefault = updated.some((p) => p.isDefault);
          if (!hasDefault) {
            return {
              providers: updated.map((p) => ({
                ...p,
                isDefault: p.id === "p-free",
              })),
            };
          }

          return { providers: updated };
        });
      },

      getActiveProvider: () => {
        const state = get();
        const defaultProvider = state.providers.find((p) => p.isDefault && p.status === "active");
        if (defaultProvider) return defaultProvider;

        const anyActive = state.providers.find((p) => p.status === "active" && p.id !== "p-free");
        if (anyActive) return anyActive;

        return (
          state.providers.find((p) => p.id === "p-free") || INITIAL_AI_PROVIDERS[0]
        );
      },
    }),
    {
      name: "socialhub-ai-providers-storage",
    }
  )
);

/**
 * Hydration-safe hook for accessing AI Providers across client components
 */
export function useMountedAIProviders() {
  const store = useAIProvidersStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeProvider = isMounted
    ? store.getActiveProvider()
    : INITIAL_AI_PROVIDERS[0];
  const providers = isMounted ? store.providers : INITIAL_AI_PROVIDERS;

  return {
    ...store,
    isMounted,
    activeProvider,
    providers,
  };
}

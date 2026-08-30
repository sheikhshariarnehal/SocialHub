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

export interface ModelPreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  isFree?: boolean;
  context?: string;
  speed?: string;
}

export const OPENROUTER_FREE_MODELS: ModelPreset[] = [
  { id: "z-ai/glm-5.2:free", name: "Z.ai: GLM 5.2", badge: "100% Free", desc: "Ultra-fast generation, 256k context", isFree: true, context: "256k", speed: "188 t/s" },
  { id: "minimax/minimax-m3:free", name: "MiniMax: MiniMax M3", badge: "100% Free", desc: "Huge 1M context window, state-of-the-art reasoning", isFree: true, context: "1,048,576", speed: "41 t/s" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA: Nemotron 3.5 Lightning", badge: "100% Free", desc: "High throughput, 1M context token window", isFree: true, context: "1,000,000", speed: "22 t/s" },
  { id: "google/gemma-4-31b-it:free", name: "Google: Gemma 4 31B", badge: "100% Free", desc: "Google's powerful 31B instruction-tuned model", isFree: true, context: "262,144", speed: "27 t/s" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Google: Gemma 4 26B A4B", badge: "100% Free", desc: "Efficient architecture with 262k context", isFree: true, context: "262,144", speed: "34 t/s" },
  { id: "inclusionai/ling-3.0-flash-fin:free", name: "Ling 3.0 Flash Fin", badge: "100% Free", desc: "High-speed finance & business reasoning", isFree: true, context: "262,144", speed: "74 t/s" },
  { id: "poolside/laguna-s-2.1:free", name: "Poolside: Laguna S 2.1", badge: "100% Free", desc: "Fast code & structured text generator", isFree: true, context: "262,144", speed: "33 t/s" },
  { id: "poolside/laguna-xs-2.1:free", name: "Poolside: Laguna XS 2.1", badge: "100% Free", desc: "Ultra-low latency (549ms), 89 t/s throughput", isFree: true, context: "262,144", speed: "89 t/s" },
  { id: "thinkingmachines/inkling-small:free", name: "Thinking Machines: Inkling Small", badge: "100% Free", desc: "1M context, 99 t/s high-speed copywriter", isFree: true, context: "1,048,576", speed: "99 t/s" },
  { id: "thinkingmachines/inkling:free", name: "Thinking Machines: Inkling", badge: "100% Free", desc: "1M context deep reasoning model", isFree: true, context: "1,048,576", speed: "42 t/s" },
  { id: "liquid/lfm-2.5-2.6b:free", name: "LiquidAI: LFM2.5 2.6B", badge: "100% Free", desc: "Liquid neural network, 158 t/s speed", isFree: true, context: "65,536", speed: "158 t/s" },
  { id: "cohere/north-mini-code:free", name: "Cohere: North Mini Code", badge: "100% Free", desc: "Low latency (442ms), 256k context", isFree: true, context: "256,000", speed: "97 t/s" },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots Studio: Dots3 Note", badge: "100% Free", desc: "512k context long-form content creator", isFree: true, context: "512,000", speed: "66 t/s" },
  { id: "minimax/minimax-m2.7:free", name: "MiniMax: MiniMax M2.7", badge: "100% Free", desc: "Versatile multilingual creator, 196k context", isFree: true, context: "196,608", speed: "41 t/s" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "NVIDIA: Nemotron 3 Super", badge: "100% Free", desc: "120B parameter powerhouse with 262k context", isFree: true, context: "262,144", speed: "44 t/s" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA: Nemotron 3 Nano Omni", badge: "100% Free", desc: "Fast reasoning model, 431ms latency", isFree: true, context: "256,000", speed: "53 t/s" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA: Nemotron 3 Ultra 550B", badge: "100% Free", desc: "Massive 550B model with 1M context", isFree: true, context: "1,000,000", speed: "10 t/s" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Meta: Llama 3.3 70B Free", badge: "100% Free", desc: "Meta's flagship open weight instruction model", isFree: true, context: "131,072", speed: "50 t/s" },
  { id: "deepseek/deepseek-chat:free", name: "DeepSeek: V3 Free", badge: "100% Free", desc: "Top-tier intelligence and coding capability", isFree: true, context: "64,000", speed: "60 t/s" },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek: R1 Reasoning Free", badge: "100% Free", desc: "Chain-of-thought advanced reasoning model", isFree: true, context: "64,000", speed: "30 t/s" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral: 7B Instruct Free", badge: "100% Free", desc: "Fast and lightweight conversational model", isFree: true, context: "32,768", speed: "80 t/s" },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen: 2.5 72B Instruct Free", badge: "100% Free", desc: "Alibaba's premier multilingual 72B model", isFree: true, context: "32,768", speed: "45 t/s" },
];

export const OPENROUTER_POPULAR_MODELS: ModelPreset[] = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", badge: "Flagship", desc: "Highest quality copywriting & brand tone match" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", badge: "Fast", desc: "Ultra-fast generation & low cost" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", badge: "High Value", desc: "State-of-the-art capability at extreme affordability" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", badge: "Reasoning", desc: "Advanced reasoning for complex thought leadership" },
  { id: "openai/gpt-4o", name: "OpenAI GPT-4o", badge: "Flagship", desc: "Versatile, high-precision multimodal content" },
  { id: "openai/gpt-4o-mini", name: "OpenAI GPT-4o Mini", badge: "Lightweight", desc: "Fast & cost-effective" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", badge: "Next-Gen", desc: "Ultra low latency & high speed" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", badge: "Open Source", desc: "Meta's flagship open weight model" },
  { id: "mistralai/mistral-large-2407", name: "Mistral Large", badge: "Power", desc: "Top European open weights model" },
];

export const OPENAI_POPULAR_MODELS: ModelPreset[] = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", badge: "Recommended", desc: "Fast, smart, and lightweight" },
  { id: "gpt-4o", name: "GPT-4o", badge: "Flagship", desc: "High performance multimodal model" },
  { id: "o3-mini", name: "o3-mini", badge: "Reasoning", desc: "High-reasoning model for technical content" },
];

export const GEMINI_POPULAR_MODELS: ModelPreset[] = [
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
    defaultModel: "z-ai/glm-5.2:free",
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

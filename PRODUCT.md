# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js (App Router), TypeScript, Tailwind CSS v4, Supabase (Postgres, Auth, Storage, Realtime), Redis/BullMQ worker service.

## Users
Primary: Solo Creators and Small Business Owners needing to publish content across 3-8 social channels fast, use AI for captioning without locked-in vendor fees, and handle comment replies in one place.
Secondary: In-house Social Media Managers and Agencies managing multiple brands via workspaces.

## Product Purpose
SocialHub is a unified social media management SaaS and AI content engine. It simplifies multi-platform post scheduling, comment monitoring, and AI caption/hashtag generation with a provider-agnostic AI model layer (BYO keys for OpenAI, Gemini, OpenRouter, Custom endpoints + free model).

## Positioning
Provider-agnostic AI social management: unlike competitors locked to a single AI vendor or expensive add-ons, SocialHub gives users complete AI model freedom (BYO API key or built-in model) with unified publishing across all 8 major social networks (Instagram, Facebook, X, LinkedIn, TikTok, YouTube, Pinterest, Threads).

## Operating Context
Daily social content composition, multi-channel post previewing, date/time scheduling, AI caption/hashtag generation, token connection status tracking, and unified feed comment replying in a high-efficiency dashboard (`Operate` mode).

## Capabilities and Constraints
- Capabilities: Multi-account OAuth connections (Meta, X, LinkedIn, TikTok, YouTube, Pinterest, Threads), unified composer with channel previews, timezone-aware scheduler, provider-agnostic AI Hub (BYO key / free model), unified comment feed, workspace scoping.
- Technical Constraints: Database-level workspace isolation via Postgres RLS; server-side encryption for OAuth refresh tokens & user AI API keys; Vercel serverless execution limits require separate background worker for long-running queues.

## Brand Commitments
- Name: SocialHub
- Voice: Efficient, empowering, modern, reliable, and intelligent without clutter.

## Evidence on Hand
- Detailed Product Requirements Document (`SocialHub_PRD.md`)
- Existing Next.js + Tailwind CSS v4 layout foundation (`layout.tsx`, `index.css`)

## Product Principles
1. Write Once, Publish Anywhere: Minimal friction to format and preview posts across 8 social platforms simultaneously.
2. AI Agnostic & Transparent: Users own their AI keys and choice of LLM without artificial markup or lock-in.
3. Fast & Focused Operate UI: High-density, scanable dashboard designed for quick task completion over flashy distractions.
4. Workspace Isolation First: Multi-tenancy and workspace security built in from day one.

## Accessibility & Inclusion
Keyboard navigable dashboard, high-contrast dark/light mode compatibility, clear focus states, screen-reader accessible form controls and preview cards.

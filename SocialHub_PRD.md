# Product Requirements Document (PRD)
## SocialHub — Unified Social Media Management & AI Content Platform

| | |
|---|---|
| **Status** | Draft v1.0 |
| **Owner** | Product |
| **Last Updated** | August 22, 2026 |
| **Doc Type** | PRD |

> "SocialHub" is a working name — swap it for your real product name before sharing this doc externally.

---

## 1. Executive Summary

SocialHub is a SaaS platform that lets individuals, creators, small businesses, and agencies connect all their social media accounts (Instagram, Facebook, X/Twitter, LinkedIn, TikTok, YouTube, Pinterest, Threads) to a single custom-built Next.js dashboard. From that dashboard, users can compose and schedule posts, monitor and reply to comments, manage direct messages, and use AI to generate content — either with a free built-in model or their own API keys from providers like OpenAI, Gemini, OpenRouter, or any custom OpenAI-compatible endpoint.

The long-term vision extends beyond scheduling into an **AI-operated social presence**: auto-replying to comments through a configurable agent, a unified inbox for all social DMs, and workspace/agency features that let teams manage many brands from one place.

---

## 2. Problem Statement

Social media managers, creators, and small business owners currently need to:
- Log into 5–8 different apps to post the same content, reply to comments, and check DMs.
- Manually adapt captions per platform (character limits, hashtag conventions, tone).
- Pay for multiple point solutions (a scheduler, an AI writer, an inbox tool) that don't talk to each other.
- Rely on one AI vendor when using AI writing tools, with no flexibility to switch providers or use models they already pay for elsewhere.

**Goal:** Build one platform that consolidates publishing, monitoring, replying, and AI content generation — with an AI layer that is provider-agnostic instead of locked to one vendor.

---

## 3. Target Users

| Persona | Description | Primary Need |
|---|---|---|
| **Solo Creator** | Individual influencer/creator managing 3–5 platforms alone | Fast posting + AI caption help, low cost |
| **Small Business Owner** | Runs marketing for their own shop/brand | Simple scheduling, reply management, doesn't want complexity |
| **Social Media Manager (in-house)** | Manages 1 brand across many platforms professionally | Analytics, approval workflows, content calendar |
| **Agency** | Manages multiple client accounts | Multi-workspace, white-label, client reporting, team roles |
| **Developer/Power user** | Wants to plug in their own AI provider or automate via API | Custom AI provider config, webhooks, API access |

---

## 4. Goals & Success Metrics

**Business goals**
- Acquire and retain paying subscribers across Free → Pro → Agency tiers.
- Become provider-agnostic on AI so cost and quality improvements pass through to users, increasing trust and retention.

**Success metrics (KPIs)**
- Activation: % of signups who connect ≥1 social account within 24 hours.
- Engagement: # of posts scheduled/published per active user per week.
- AI adoption: % of posts created with AI assistance.
- Retention: 30/60/90-day retention, churn rate by tier.
- Reliability: % of scheduled posts published successfully without manual retry.
- Time-to-first-value: time from signup to first successful post.

---

## 5. Scope Overview

| Phase | Theme | Includes |
|---|---|---|
| **MVP (Phase 1)** | Core publishing + monitoring | Auth, account connections, composer, scheduler, unified feed monitoring, manual replies, basic analytics, built-in free AI writer |
| **Phase 2 (Advanced)** | Multi-provider AI + team features | Custom AI provider (BYO key), brand voice, content calendar, approval workflows, workspaces/multi-brand |
| **Phase 3 (Future)** | Automation + unified inbox | Auto-reply agent, unified DM/comment inbox, social listening, sentiment alerts, agency/white-label mode |

---

## 6. MVP Feature Requirements (Phase 1)

### 6.1 Authentication & Account Management
- Email/password + OAuth login (Google, GitHub).
- Email verification, password reset, 2FA (TOTP) as a security add-on.
- Workspace concept from day one (even for solo users, a workspace = 1 default workspace) — this avoids a painful migration later when teams/agencies are added.
- User profile & billing settings.

### 6.2 Social Account Connections
- OAuth-based connection flow for: **Instagram (via Facebook Graph API), Facebook Pages, X/Twitter, LinkedIn (personal + company pages), TikTok, YouTube, Pinterest, Threads.**
- Store access/refresh tokens encrypted at rest (see §11 Security).
- Token refresh handling with proactive renewal and user re-auth prompts when a token expires or is revoked.
- Connection health dashboard: show which accounts are connected, expiring soon, or disconnected/errored.
- Support multiple accounts per platform (e.g., 2 Instagram accounts).

### 6.3 Unified Dashboard (Next.js)
- Central overview: connected accounts, upcoming scheduled posts, recent engagement summary, alerts (failed posts, expiring tokens).
- Responsive design (desktop-first, usable on mobile browser); dedicated mobile app is a later consideration (see §9).

### 6.4 Post Composer & Publishing
- Single composer to write once and publish/adapt to multiple platforms simultaneously.
- Per-platform preview (character limits, image/video aspect ratio requirements, hashtag placement).
- Media upload: images, video, carousels; basic in-app cropping per platform spec.
- Immediate publish or schedule for later (date/time picker, timezone-aware).
- Draft saving.
- Queue/calendar view of scheduled posts.
- Retry logic + failure notifications if a platform API call fails.

### 6.5 Monitoring & Engagement
- Unified feed of comments across connected accounts on published posts.
- Filter by platform, post, sentiment (basic keyword-based initially), read/unread.
- Manual reply to comments directly from the dashboard.
- Basic notification system (in-app + email) for new comments/mentions.

### 6.6 Analytics (Basic)
- Per-post metrics: likes, comments, shares, reach/impressions (as available per platform API).
- Simple time-series charts per account.
- Export to CSV.

### 6.7 Default AI Writing Assistant
- Built-in free model (e.g., a hosted small/efficient LLM) available to all users with sensible rate limits on the free tier.
- "Generate caption," "Generate hashtags," "Rewrite in [tone]," "Shorten/expand," "Translate" actions inside the composer.
- Usage caps clearly shown (e.g., "12/20 free AI generations this month").

---

## 7. Advanced Feature Requirements (Phase 2)

### 7.1 Multi-Provider AI Integration ("AI Provider Hub")
This is a key differentiator, so it deserves its own architecture, not just a settings toggle.

- **Provider abstraction layer**: a unified internal interface so the app calls one internal `generate()` function regardless of backend provider.
- **Supported provider types**:
  - Built-in free/default model (platform-hosted).
  - **OpenAI (ChatGPT API)** — user supplies their own API key.
  - **Google Gemini API** — user supplies their own API key.
  - **OpenRouter** — one key, access to many models; good default "power user" option.
  - **Custom/self-hosted** — any OpenAI-compatible endpoint (e.g., local Ollama, vLLM, Azure OpenAI, Bedrock via proxy) with a user-defined base URL, key, and model name.
- **Provider management UI**: add/remove providers, set one as default, per-workspace or per-user provider selection, test-connection button, masked key display, usage/cost tracking per provider (if the provider returns token usage).
- **Prompt templates & brand voice**: saved reusable prompts, a "brand voice" profile (tone, style examples, banned words) injected into every generation automatically.
- **Model fallback chain**: if primary provider fails/rate-limits, fall back to secondary provider or the free default — important for reliability.
- **Cost/quota guardrails**: per-user or per-workspace spend caps to prevent runaway API bills when using BYO keys, and generation quotas for the free tier.

### 7.2 Content Calendar & Approval Workflows
- Drag-and-drop calendar view across all platforms.
- Multi-step approval: draft → pending review → approved → scheduled (roles: Editor, Approver, Admin).
- Comments/notes on drafts for internal collaboration.

### 7.3 Workspaces & Multi-Brand Support
- One account can own multiple workspaces (e.g., an agency managing 5 client brands).
- Role-based access control (Owner, Admin, Editor, Viewer) per workspace.
- Workspace switcher in the dashboard nav.

### 7.4 Bulk Operations
- CSV/bulk upload for scheduling many posts at once (useful for evergreen content or campaigns).
- Content recycling: automatically re-queue evergreen posts on a schedule.

---

## 8. Future Features (Phase 3, as requested)

### 8.1 Auto Comment Reply Agent
- Configurable AI agent that can auto-reply to comments based on rules:
  - Keyword/intent triggers (e.g., "price," "shipping," FAQ-type questions).
  - Tone/persona settings matching brand voice.
  - **Human-in-the-loop mode**: agent drafts a reply, human approves before sending (recommended default).
  - **Full-auto mode**: agent replies without review, with a safety net (blocklist of topics/words it must never respond to, auto-escalation to a human for complaints, legal questions, or negative sentiment spikes).
- Audit log of every auto-reply sent, with the ability to review and disable per account.
- Rate limiting to stay within each platform's API/comment-reply limits and avoid spam flags.

### 8.2 Unified Social Inbox (Chat)
- Single inbox aggregating **DMs, comments, and mentions** across all connected platforms — similar to a shared team inbox (like a helpdesk, but for social).
- Assign conversations to team members, mark as resolved, tag/categorize conversations.
- Canned responses + AI-suggested replies (using the same Provider Hub from §7.1).
- Search across all conversations.

### 8.3 Additional Recommended Features
Based on what tends to separate a "good enough" tool from a professional-grade platform in this category, I'd recommend including the following in the roadmap:

| Feature | Why it matters |
|---|---|
| **Best-time-to-post AI suggestions** | Uses historical engagement data per account to recommend optimal scheduling times. |
| **Social listening / keyword monitoring** | Track brand mentions and keywords beyond just owned posts — critical for reputation management. |
| **Sentiment analysis & crisis alerts** | Auto-detect spikes in negative sentiment and alert the team in real time — prevents PR issues from being missed. |
| **Link-in-bio micro-page builder** | Common companion feature (like Linktree) that keeps users inside your ecosystem instead of a third-party tool. |
| **UTM auto-tagging & link shortener** | Ties social posts to actual website traffic/conversion data — important for proving ROI. |
| **A/B testing / caption variants** | Auto-generate 2–3 AI caption variants and track which performs better. |
| **Brand asset library** | Central place for logos, brand colors, fonts, approved images — feeds into the composer and AI prompts. |
| **White-label / client-facing reports** | Agencies can brand the dashboard/reports for their own clients — a strong upsell for the Agency tier. |
| **Browser extension** | "Share to SocialHub" from anywhere on the web, quick-schedule without opening the full app. |
| **Public API + Webhooks (Zapier/Make support)** | Lets power users integrate SocialHub into their own automation stacks. |
| **Audit logs & activity history** | Required for team/agency trust and accountability — who posted/replied/deleted what. |
| **Data export & account deletion (GDPR/CCPA)** | Legal requirement in most markets; build in from the start rather than retrofitting. |
| **In-app notification center + digest emails** | Weekly performance digest, daily comment digest — keeps users engaged without needing to log in constantly. |
| **Mobile app (iOS/Android)** | For on-the-go approvals, quick replies, and push notifications — natural post-MVP investment once web is stable. |

---

## 9. Technical Architecture (Recommended)

### 9.1 High-Level Stack

| Layer | Recommendation | Notes |
|---|---|---|
| Frontend | **Next.js (App Router)** + TypeScript, Tailwind CSS, shadcn/ui | Matches your requirement; SSR for dashboard, ISR/static for marketing pages |
| Backend API | Next.js API routes / Route Handlers for simple endpoints; a separate **Node.js (NestJS) service** for heavy background work | Keeps scheduling/publishing workers decoupled from the web app |
| Database | **Supabase (PostgreSQL)** — *decided* | Relational integrity for accounts, posts, comments; gives Postgres + Auth + Storage + Realtime + Edge Functions from one platform, reducing the number of services to integrate |
| Auth | **Supabase Auth** | Email/password, OAuth (Google/GitHub) login, 2FA; issues JWTs that Postgres Row Level Security (RLS) policies can consume directly — see §9.4 |
| Media Storage | **Supabase Storage** | Buckets per workspace for images/video to be published; signed URLs for private media |
| Realtime | **Supabase Realtime** (Postgres change subscriptions) | Good native fit for the live comment feed and Phase 3 unified inbox — subscribe to new rows on the Comment/Message tables instead of building a separate WebSocket layer |
| Queue / Jobs | **Redis + BullMQ** (or Inngest/Trigger.dev) running in a separate worker service | Supabase doesn't include a heavy job queue; scheduled publishing, token refresh, and comment polling still need a dedicated queue for reliability at scale. `pg_cron`/`pg_net` inside Supabase can handle lightweight periodic checks, but shouldn't carry the full publishing pipeline |
| Secrets/Key storage | **Supabase Vault** (pgsodium-based column encryption) or app-layer encryption before insert | Social OAuth tokens and user-supplied AI provider keys must be encrypted at rest |
| AI Layer | Internal **Provider Router service** wrapping OpenAI, Gemini, OpenRouter, custom endpoints | Normalizes requests/responses, handles fallback and quota logic; can run as a Supabase Edge Function or as part of the Node worker service |
| Background workers | Separate worker process(es) for: scheduled publishing, token refresh, comment polling/webhooks, auto-reply agent, analytics aggregation | Connects to Supabase Postgres directly (via connection pooler/pgbouncer) rather than going through the client SDK |
| Hosting | Vercel (frontend) + Supabase (managed Postgres/Auth/Storage/Realtime) + a container platform (Fly.io/Railway/AWS ECS) for the worker service | Vercel functions have execution time limits unsuitable for long-running polling/agent jobs, so the worker stays separate from the Next.js deployment |

### 9.2 Core Data Model (high level)

- **User** — id, email, auth info, 2FA status
- **Workspace** — id, name, owner, plan/tier
- **WorkspaceMember** — user, workspace, role (Owner/Admin/Editor/Viewer)
- **SocialAccount** — workspace, platform, external account id, encrypted tokens, status, expiry
- **Post** — workspace, author, content, media refs, status (draft/scheduled/published/failed), scheduled_at
- **PostTarget** — post, social_account, platform-specific overrides, publish result/external post id
- **Comment/Message** — social_account, external id, source post, author, content, sentiment, status (unread/read/replied), reply thread
- **AIProviderConfig** — workspace/user, provider type, encrypted API key, base URL (for custom), default model, active flag
- **AutoReplyRule** — workspace, account, trigger conditions, mode (review/auto), persona/prompt template
- **AuditLog** — workspace, actor, action, target, timestamp
- **Subscription/Plan** — workspace, tier, billing status, usage counters (AI generations, connected accounts, scheduled posts)

### 9.3 Platform API Integration Notes
- Each platform (Meta Graph API, X API, LinkedIn API, TikTok API, YouTube Data API, Pinterest API) has **different rate limits, review/approval processes for production access, and content policies** — this is typically the single biggest source of delay in this kind of product. Plan for:
  - App review submissions (especially Meta/Instagram and TikTok require business verification and use-case review before you get production-level API access).
  - Per-platform rate-limit-aware queuing so one account's limit doesn't block others.
  - Webhook subscriptions where available (Meta, others) to receive comments/mentions in near-real-time instead of polling.
  - Graceful degradation: if a given platform's API doesn't expose a feature (e.g., DMs), clearly show that as "not supported" rather than silently failing.

### 9.4 Multi-Tenancy with Row Level Security (RLS)

Since Supabase is Postgres, workspace isolation should be enforced at the database layer, not just in application code:

- Enable **RLS on every table** that holds workspace-scoped data (SocialAccount, Post, Comment/Message, AIProviderConfig, AuditLog, etc.).
- Policies check `workspace_id` against the requesting user's workspace membership (via a `WorkspaceMember` lookup or a JWT claim set at login).
- This means even if a bug in the Next.js app forgets a `WHERE workspace_id = ...` clause, the database itself still blocks cross-workspace data leaks — important once Agency/multi-client workspaces exist in Phase 2.
- The background worker service (which needs broader access than any single user) should connect using the Supabase **service role key**, bypassing RLS deliberately and carefully — this key must never be exposed to the frontend.
- Encrypted columns (OAuth tokens, AI provider keys) should stay unreadable even to users with row access, decrypted only server-side when actually needed for an API call.

---

## 10. AI Provider Hub — Detailed Requirements

Since this is explicitly a differentiator, spelling it out:

1. **Settings > AI Providers** page lists all configured providers with status (Active/Error/Untested).
2. **Add Provider** flow:
   - Select type: Free (default), OpenAI, Gemini, OpenRouter, Custom.
   - For Custom: fields for Base URL, API Key, Model name, and a "Test Connection" button that sends a trivial ping request.
3. **Default provider** selection at workspace level, with per-user override allowed (e.g., an editor prefers Gemini, another prefers their OpenRouter key).
4. **Usage dashboard**: generations run, tokens used (if reported), estimated cost (if provider returns pricing-relevant usage), per provider.
5. **Fallback order**: user can rank providers 1st/2nd/3rd for automatic failover.
6. **Content safety layer**: regardless of provider, run a lightweight moderation pass on AI-generated content before it's allowed to auto-publish (important once auto-reply/full-auto mode exists in Phase 3).

---

## 11. Non-Functional Requirements

- **Security**: encrypt all OAuth tokens and AI provider keys at rest (Supabase Vault or app-layer encryption); enforce workspace isolation via Postgres RLS (§9.4); TLS everywhere; least-privilege OAuth scopes per platform; SOC 2-style access controls as the product matures toward agency/enterprise customers.
- **Privacy/Compliance**: GDPR/CCPA-compliant data export & deletion; clear data retention policy for comments/messages pulled from third-party platforms.
- **Reliability**: scheduled posts should have retry + alerting; target ≥99% successful publish rate excluding third-party platform outages.
- **Scalability**: queue-based architecture so publishing/comment-polling scales horizontally as accounts grow.
- **Rate-limit compliance**: respect each platform's published API rate limits; back off and queue rather than fail hard.
- **Auditability**: every automated action (AI-generated post, auto-reply) must be logged and attributable.

---

## 12. Monetization (Suggested Tiers)

| Tier | Target user | Includes |
|---|---|---|
| **Free** | Individuals trying it out | 1–2 connected accounts, limited scheduled posts/month, capped free-model AI generations, no BYO AI provider |
| **Pro** | Solo creators/small biz | Unlimited scheduling, more connected accounts, BYO AI provider keys, basic analytics, content calendar |
| **Team** | In-house social teams | Multiple workspace members, approval workflows, unified inbox, sentiment alerts |
| **Agency** | Agencies/consultants | Multi-workspace/multi-client, white-label reports, priority support, higher AI/automation quotas |

Usage-based add-ons: extra AI generations, extra connected accounts, extra scheduled posts — useful levers beyond flat tiers.

---

## 13. Risks & Open Challenges

| Risk | Mitigation |
|---|---|
| Platform API approval delays (Meta/TikTok business verification) | Start these applications early in development, not at launch |
| Platform policy changes breaking integrations | Abstract each platform behind an adapter interface so changes are isolated |
| Users' BYO AI API costs surprising them | Show real-time usage estimates and let users set spend caps |
| Auto-reply agent posting something off-brand or harmful | Default to human-in-the-loop review mode; moderation pass before any auto-publish |
| Rate limits causing delayed posts at scale | Smart per-account queuing with visible status to users |
| Token/credential security breach | Encryption at rest, key rotation, minimal OAuth scopes, regular security audits |

---

## 14. Roadmap Summary

```
Phase 1 (MVP)        →  Auth, account connections, composer/scheduler,
                         basic monitoring & reply, basic analytics,
                         free built-in AI writer

Phase 2 (Advanced)   →  Multi-provider AI hub (OpenAI/Gemini/OpenRouter/
                         Custom), brand voice, content calendar,
                         approval workflows, workspaces/multi-brand

Phase 3 (Future)     →  Auto-reply agent, unified inbox/chat,
                         social listening, sentiment alerts,
                         white-label/agency mode, mobile app,
                         browser extension, public API
```

---

## 15. Open Questions for Stakeholder Input

1. Which platforms are must-have at MVP vs. nice-to-have (all 7+ at once is a large API-integration lift)?
2. What's the pricing model preference — flat tiers, usage-based, or hybrid?
3. Is a mobile app a near-term requirement, or can web (mobile-responsive) suffice through Phase 2?
4. For the auto-reply agent, should full-auto mode ever be allowed, or should human-in-the-loop be mandatory at launch?
5. Target initial market: solo creators, SMBs, or agencies first — this affects which features (white-label, multi-workspace) should be prioritized earlier.

---

*End of document.*

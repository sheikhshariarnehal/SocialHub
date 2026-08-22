-- =====================================================================
-- SocialHub — Initial Database Schema (Supabase / PostgreSQL)
-- =====================================================================
-- Run this as a Supabase migration (supabase/migrations/xxxx_init.sql)
-- or paste into the Supabase SQL Editor.
--
-- Assumes:
--   - Supabase Auth is enabled (auth.users already exists)
--   - Supabase Vault is enabled for secret storage (recommended)
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. ENUM TYPES
-- =====================================================================

create type workspace_role as enum ('owner', 'admin', 'editor', 'viewer');

create type platform_type as enum (
  'instagram', 'facebook', 'twitter', 'linkedin',
  'tiktok', 'youtube', 'pinterest', 'threads'
);

create type social_account_status as enum (
  'connected', 'expiring_soon', 'expired', 'revoked', 'error'
);

create type post_status as enum (
  'draft', 'pending_review', 'approved', 'scheduled',
  'publishing', 'published', 'failed'
);

create type post_target_status as enum ('pending', 'published', 'failed');

create type message_type as enum ('comment', 'dm', 'mention');

create type message_direction as enum ('inbound', 'outbound');

create type message_status as enum ('unread', 'read', 'replied', 'archived');

create type ai_provider_type as enum (
  'free_default', 'openai', 'gemini', 'openrouter', 'custom'
);

create type reply_mode as enum ('review', 'auto');

create type subscription_tier as enum ('free', 'pro', 'team', 'agency');

-- =====================================================================
-- 2. WORKSPACES & MEMBERSHIP
-- =====================================================================

create table workspaces (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  owner_id      uuid not null references auth.users(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          workspace_role not null default 'viewer',
  invited_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index idx_workspace_members_workspace on workspace_members(workspace_id);
create index idx_workspace_members_user on workspace_members(user_id);

-- =====================================================================
-- 3. SOCIAL ACCOUNTS
-- =====================================================================

create table social_accounts (
  id                        uuid primary key default gen_random_uuid(),
  workspace_id              uuid not null references workspaces(id) on delete cascade,
  platform                  platform_type not null,
  external_account_id       text not null,
  display_name              text,
  avatar_url                text,
  status                    social_account_status not null default 'connected',
  -- Store only references to Supabase Vault secrets, never raw tokens here.
  access_token_secret_id    uuid,
  refresh_token_secret_id   uuid,
  token_expires_at          timestamptz,
  connected_by              uuid references auth.users(id),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (workspace_id, platform, external_account_id)
);

create index idx_social_accounts_workspace on social_accounts(workspace_id);
create index idx_social_accounts_status on social_accounts(status);

-- =====================================================================
-- 4. POSTS & PUBLISHING TARGETS
-- =====================================================================

create table posts (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  author_id      uuid references auth.users(id),
  content        text not null default '',
  media          jsonb not null default '[]',   -- array of {storage_path, type, order}
  status         post_status not null default 'draft',
  scheduled_at   timestamptz,
  published_at   timestamptz,
  ai_generated   boolean not null default false,
  ai_provider_id uuid,  -- set below via FK after ai_provider_configs is created
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_posts_workspace on posts(workspace_id);
create index idx_posts_status on posts(status);
create index idx_posts_scheduled_at on posts(scheduled_at);

create table post_targets (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references posts(id) on delete cascade,
  social_account_id uuid not null references social_accounts(id) on delete cascade,
  content_override  text,          -- platform-specific caption override, if any
  status            post_target_status not null default 'pending',
  external_post_id  text,          -- id returned by the platform once published
  error_message     text,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (post_id, social_account_id)
);

create index idx_post_targets_post on post_targets(post_id);
create index idx_post_targets_account on post_targets(social_account_id);
create index idx_post_targets_status on post_targets(status);

-- =====================================================================
-- 5. COMMENTS / DMs / MENTIONS (unified inbox source table)
-- =====================================================================

create table messages (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  social_account_id   uuid not null references social_accounts(id) on delete cascade,
  post_target_id      uuid references post_targets(id) on delete set null,
  type                message_type not null,
  direction           message_direction not null default 'inbound',
  external_id         text not null,
  parent_external_id  text,             -- for threaded replies
  author_name         text,
  author_external_id  text,
  content             text not null default '',
  sentiment           text,             -- e.g. 'positive' | 'neutral' | 'negative'
  status              message_status not null default 'unread',
  is_ai_generated     boolean not null default false,
  handled_by          uuid references auth.users(id),   -- null if handled by agent
  assigned_to         uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  received_at         timestamptz not null default now(),
  unique (social_account_id, external_id)
);

create index idx_messages_workspace on messages(workspace_id);
create index idx_messages_account on messages(social_account_id);
create index idx_messages_status on messages(status);
create index idx_messages_type on messages(type);
create index idx_messages_parent on messages(parent_external_id);

-- =====================================================================
-- 6. AI PROVIDER HUB
-- =====================================================================

create table ai_provider_configs (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references workspaces(id) on delete cascade,
  user_id            uuid references auth.users(id),  -- null = workspace-level default
  provider_type      ai_provider_type not null,
  display_name       text not null,
  base_url           text,             -- required for 'custom' provider type
  default_model      text,
  api_key_secret_id  uuid,             -- reference to Supabase Vault secret, never plaintext
  is_default         boolean not null default false,
  fallback_priority  int not null default 0,   -- lower = tried first
  is_active          boolean not null default true,
  last_tested_at     timestamptz,
  last_test_status   text,             -- 'ok' | 'error'
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_ai_providers_workspace on ai_provider_configs(workspace_id);

alter table posts
  add constraint fk_posts_ai_provider
  foreign key (ai_provider_id) references ai_provider_configs(id) on delete set null;

create table brand_voices (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  name            text not null,
  tone            text,
  style_examples  text,
  banned_words    text[] default '{}',
  is_default      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_brand_voices_workspace on brand_voices(workspace_id);

create table prompt_templates (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  name            text not null,
  prompt_text     text not null,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create index idx_prompt_templates_workspace on prompt_templates(workspace_id);

-- =====================================================================
-- 7. AUTO-REPLY AGENT RULES (Phase 3)
-- =====================================================================

create table auto_reply_rules (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  social_account_id   uuid references social_accounts(id) on delete cascade,
  name                text not null,
  trigger_type        text not null,        -- 'keyword' | 'intent' | 'all'
  trigger_value       jsonb not null default '[]',
  mode                reply_mode not null default 'review',
  prompt_template_id  uuid references prompt_templates(id),
  brand_voice_id      uuid references brand_voices(id),
  is_active           boolean not null default true,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_auto_reply_rules_workspace on auto_reply_rules(workspace_id);
create index idx_auto_reply_rules_account on auto_reply_rules(social_account_id);

-- =====================================================================
-- 8. SUBSCRIPTIONS / BILLING
-- =====================================================================

create table subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  workspace_id              uuid not null unique references workspaces(id) on delete cascade,
  tier                      subscription_tier not null default 'free',
  status                    text not null default 'active',  -- 'active' | 'past_due' | 'canceled'
  stripe_customer_id        text,
  stripe_subscription_id    text,
  current_period_end        timestamptz,
  ai_generation_quota       int not null default 20,
  ai_generations_used       int not null default 0,
  connected_accounts_limit  int not null default 2,
  scheduled_posts_limit     int not null default 30,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- =====================================================================
-- 9. NOTIFICATIONS & AUDIT LOG
-- =====================================================================

create table notifications (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null,        -- 'post_failed' | 'new_comment' | 'token_expiring' | ...
  title         text not null,
  body          text,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, is_read);

create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  actor_id      uuid references auth.users(id),   -- null if performed by system/agent
  action        text not null,          -- e.g. 'post.published', 'auto_reply.sent'
  target_type   text not null,          -- e.g. 'post', 'message', 'social_account'
  target_id     uuid,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index idx_audit_logs_workspace on audit_logs(workspace_id, created_at desc);

-- =====================================================================
-- 10. updated_at AUTO-UPDATE TRIGGER
-- =====================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_workspaces_updated_at before update on workspaces
  for each row execute function set_updated_at();
create trigger trg_social_accounts_updated_at before update on social_accounts
  for each row execute function set_updated_at();
create trigger trg_posts_updated_at before update on posts
  for each row execute function set_updated_at();
create trigger trg_ai_provider_configs_updated_at before update on ai_provider_configs
  for each row execute function set_updated_at();
create trigger trg_auto_reply_rules_updated_at before update on auto_reply_rules
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- =====================================================================
-- 11. ROW LEVEL SECURITY (RLS) — workspace isolation
-- =====================================================================
-- The Node.js worker service should connect using the Supabase
-- service_role key, which bypasses RLS by design. Never expose the
-- service_role key to the frontend.

create or replace function is_workspace_member(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$ language sql stable security definer;

create or replace function has_workspace_role(ws_id uuid, roles workspace_role[])
returns boolean as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role = any(roles)
  );
$$ language sql stable security definer;

-- Enable RLS on every workspace-scoped table
alter table workspaces          enable row level security;
alter table workspace_members   enable row level security;
alter table social_accounts     enable row level security;
alter table posts               enable row level security;
alter table post_targets        enable row level security;
alter table messages            enable row level security;
alter table ai_provider_configs enable row level security;
alter table brand_voices        enable row level security;
alter table prompt_templates    enable row level security;
alter table auto_reply_rules    enable row level security;
alter table subscriptions       enable row level security;
alter table notifications       enable row level security;
alter table audit_logs          enable row level security;

-- workspaces: members can read; owner/admin can update/delete
create policy "workspaces_select" on workspaces for select
  using (is_workspace_member(id));
create policy "workspaces_insert" on workspaces for insert
  with check (owner_id = auth.uid());
create policy "workspaces_update" on workspaces for update
  using (has_workspace_role(id, array['owner','admin']::workspace_role[]));
create policy "workspaces_delete" on workspaces for delete
  using (has_workspace_role(id, array['owner']::workspace_role[]));

-- workspace_members: members can view roster; owner/admin manage membership
create policy "members_select" on workspace_members for select
  using (is_workspace_member(workspace_id));
create policy "members_insert" on workspace_members for insert
  with check (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));
create policy "members_update" on workspace_members for update
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));
create policy "members_delete" on workspace_members for delete
  using (
    has_workspace_role(workspace_id, array['owner','admin']::workspace_role[])
    or user_id = auth.uid()   -- members can remove themselves
  );

-- generic pattern applied to remaining workspace-scoped tables:
-- SELECT -> any member; INSERT/UPDATE -> owner/admin/editor; DELETE -> owner/admin

create policy "social_accounts_select" on social_accounts for select
  using (is_workspace_member(workspace_id));
create policy "social_accounts_write" on social_accounts for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "social_accounts_update" on social_accounts for update
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "social_accounts_delete" on social_accounts for delete
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));

create policy "posts_select" on posts for select
  using (is_workspace_member(workspace_id));
create policy "posts_insert" on posts for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "posts_update" on posts for update
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "posts_delete" on posts for delete
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));

create policy "post_targets_select" on post_targets for select
  using (is_workspace_member((select workspace_id from posts where posts.id = post_id)));
create policy "post_targets_write" on post_targets for insert
  with check (has_workspace_role((select workspace_id from posts where posts.id = post_id), array['owner','admin','editor']::workspace_role[]));
create policy "post_targets_update" on post_targets for update
  using (has_workspace_role((select workspace_id from posts where posts.id = post_id), array['owner','admin','editor']::workspace_role[]));

create policy "messages_select" on messages for select
  using (is_workspace_member(workspace_id));
create policy "messages_write" on messages for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "messages_update" on messages for update
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));

create policy "ai_providers_select" on ai_provider_configs for select
  using (is_workspace_member(workspace_id));
create policy "ai_providers_write" on ai_provider_configs for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "ai_providers_update" on ai_provider_configs for update
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "ai_providers_delete" on ai_provider_configs for delete
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));

create policy "brand_voices_select" on brand_voices for select
  using (is_workspace_member(workspace_id));
create policy "brand_voices_write" on brand_voices for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));

create policy "prompt_templates_select" on prompt_templates for select
  using (is_workspace_member(workspace_id));
create policy "prompt_templates_write" on prompt_templates for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));

create policy "auto_reply_rules_select" on auto_reply_rules for select
  using (is_workspace_member(workspace_id));
create policy "auto_reply_rules_write" on auto_reply_rules for insert
  with check (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "auto_reply_rules_update" on auto_reply_rules for update
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
create policy "auto_reply_rules_delete" on auto_reply_rules for delete
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));

create policy "subscriptions_select" on subscriptions for select
  using (is_workspace_member(workspace_id));
create policy "subscriptions_update" on subscriptions for update
  using (has_workspace_role(workspace_id, array['owner']::workspace_role[]));

create policy "notifications_select" on notifications for select
  using (user_id = auth.uid());
create policy "notifications_update" on notifications for update
  using (user_id = auth.uid());

create policy "audit_logs_select" on audit_logs for select
  using (has_workspace_role(workspace_id, array['owner','admin','editor']::workspace_role[]));
-- Inserts into audit_logs are performed by the backend using the
-- service_role key (which bypasses RLS), so no client insert policy
-- is defined here by design.

-- =====================================================================
-- End of schema
-- =====================================================================

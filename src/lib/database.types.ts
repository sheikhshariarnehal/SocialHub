/**
 * TypeScript types for the SocialHub database schema.
 * Generated from schema.sql — keep in sync with migrations.
 */

// =====================================================================
// Enum Types
// =====================================================================

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export type PlatformType =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "threads";

export type SocialAccountStatus =
  | "connected"
  | "expiring_soon"
  | "expired"
  | "revoked"
  | "error";

export type PostStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type PostTargetStatus = "pending" | "published" | "failed";

export type MessageType = "comment" | "dm" | "mention";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "unread" | "read" | "replied" | "archived";

export type AIProviderType =
  | "free_default"
  | "openai"
  | "gemini"
  | "openrouter"
  | "custom";

export type ReplyMode = "review" | "auto";
export type SubscriptionTier = "free" | "pro" | "team" | "agency";

// =====================================================================
// Table Row Types
// =====================================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  created_at: string;
}

export interface SocialAccount {
  id: string;
  workspace_id: string;
  platform: PlatformType;
  external_account_id: string;
  display_name: string | null;
  avatar_url: string | null;
  status: SocialAccountStatus;
  access_token?: string | null;
  refresh_token?: string | null;
  access_token_secret_id: string | null;
  refresh_token_secret_id: string | null;
  token_expires_at: string | null;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  author_id: string | null;
  content: string;
  media: MediaItem[];
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  ai_generated: boolean;
  ai_provider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  storage_path: string;
  type: "image" | "video" | "gif";
  order: number;
}

export interface PostTarget {
  id: string;
  post_id: string;
  social_account_id: string;
  content_override: string | null;
  status: PostTargetStatus;
  external_post_id: string | null;
  error_message: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  workspace_id: string;
  social_account_id: string;
  post_target_id: string | null;
  type: MessageType;
  direction: MessageDirection;
  external_id: string;
  parent_external_id: string | null;
  author_name: string | null;
  author_external_id: string | null;
  content: string;
  sentiment: string | null;
  status: MessageStatus;
  is_ai_generated: boolean;
  handled_by: string | null;
  assigned_to: string | null;
  created_at: string;
  received_at: string;
}

export interface AIProviderConfig {
  id: string;
  workspace_id: string;
  user_id: string | null;
  provider_type: AIProviderType;
  display_name: string;
  base_url: string | null;
  default_model: string | null;
  api_key_secret_id: string | null;
  is_default: boolean;
  fallback_priority: number;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandVoice {
  id: string;
  workspace_id: string;
  name: string;
  tone: string | null;
  style_examples: string | null;
  banned_words: string[];
  is_default: boolean;
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  workspace_id: string;
  name: string;
  prompt_text: string;
  created_by: string | null;
  created_at: string;
}

export interface AutoReplyRule {
  id: string;
  workspace_id: string;
  social_account_id: string | null;
  name: string;
  trigger_type: string;
  trigger_value: unknown[];
  mode: ReplyMode;
  prompt_template_id: string | null;
  brand_voice_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  tier: SubscriptionTier;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  ai_generation_quota: number;
  ai_generations_used: number;
  connected_accounts_limit: number;
  scheduled_posts_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  workspace_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// =====================================================================
// Supabase Database Type (for createClient<Database>)
// =====================================================================

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      social_accounts: {
        Row: SocialAccount;
        Insert: {
          id?: string;
          workspace_id: string;
          platform: PlatformType;
          external_account_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          status?: SocialAccountStatus;
          access_token_secret_id?: string | null;
          refresh_token_secret_id?: string | null;
          token_expires_at?: string | null;
          connected_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          platform?: PlatformType;
          external_account_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          status?: SocialAccountStatus;
          access_token_secret_id?: string | null;
          refresh_token_secret_id?: string | null;
          token_expires_at?: string | null;
          connected_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: {
          id?: string;
          workspace_id: string;
          author_id?: string | null;
          content?: string;
          media?: MediaItem[];
          status?: PostStatus;
          scheduled_at?: string | null;
          published_at?: string | null;
          ai_generated?: boolean;
          ai_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          author_id?: string | null;
          content?: string;
          media?: MediaItem[];
          status?: PostStatus;
          scheduled_at?: string | null;
          published_at?: string | null;
          ai_generated?: boolean;
          ai_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_targets: {
        Row: PostTarget;
        Insert: {
          id?: string;
          post_id: string;
          social_account_id: string;
          content_override?: string | null;
          status?: PostTargetStatus;
          external_post_id?: string | null;
          error_message?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          social_account_id?: string;
          content_override?: string | null;
          status?: PostTargetStatus;
          external_post_id?: string | null;
          error_message?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: {
          id?: string;
          workspace_id: string;
          social_account_id: string;
          post_target_id?: string | null;
          type: MessageType;
          direction?: MessageDirection;
          external_id: string;
          parent_external_id?: string | null;
          author_name?: string | null;
          author_external_id?: string | null;
          content?: string;
          sentiment?: string | null;
          status?: MessageStatus;
          is_ai_generated?: boolean;
          handled_by?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          received_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          social_account_id?: string;
          post_target_id?: string | null;
          type?: MessageType;
          direction?: MessageDirection;
          external_id?: string;
          parent_external_id?: string | null;
          author_name?: string | null;
          author_external_id?: string | null;
          content?: string;
          sentiment?: string | null;
          status?: MessageStatus;
          is_ai_generated?: boolean;
          handled_by?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          received_at?: string;
        };
        Relationships: [];
      };
      ai_provider_configs: {
        Row: AIProviderConfig;
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          provider_type: AIProviderType;
          display_name: string;
          base_url?: string | null;
          default_model?: string | null;
          api_key_secret_id?: string | null;
          is_default?: boolean;
          fallback_priority?: number;
          is_active?: boolean;
          last_tested_at?: string | null;
          last_test_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          provider_type?: AIProviderType;
          display_name?: string;
          base_url?: string | null;
          default_model?: string | null;
          api_key_secret_id?: string | null;
          is_default?: boolean;
          fallback_priority?: number;
          is_active?: boolean;
          last_tested_at?: string | null;
          last_test_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_voices: {
        Row: BrandVoice;
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          tone?: string | null;
          style_examples?: string | null;
          banned_words?: string[];
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          tone?: string | null;
          style_examples?: string | null;
          banned_words?: string[];
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      prompt_templates: {
        Row: PromptTemplate;
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          prompt_text: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          prompt_text?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      auto_reply_rules: {
        Row: AutoReplyRule;
        Insert: {
          id?: string;
          workspace_id: string;
          social_account_id?: string | null;
          name: string;
          trigger_type: string;
          trigger_value?: unknown[];
          mode?: ReplyMode;
          prompt_template_id?: string | null;
          brand_voice_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          social_account_id?: string | null;
          name?: string;
          trigger_type?: string;
          trigger_value?: unknown[];
          mode?: ReplyMode;
          prompt_template_id?: string | null;
          brand_voice_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          id?: string;
          workspace_id: string;
          tier?: SubscriptionTier;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          ai_generation_quota?: number;
          ai_generations_used?: number;
          connected_accounts_limit?: number;
          scheduled_posts_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          tier?: SubscriptionTier;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          ai_generation_quota?: number;
          ai_generations_used?: number;
          connected_accounts_limit?: number;
          scheduled_posts_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: {
          id?: string;
          workspace_id: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      workspace_role: WorkspaceRole;
      platform_type: PlatformType;
      social_account_status: SocialAccountStatus;
      post_status: PostStatus;
      post_target_status: PostTargetStatus;
      message_type: MessageType;
      message_direction: MessageDirection;
      message_status: MessageStatus;
      ai_provider_type: AIProviderType;
      reply_mode: ReplyMode;
      subscription_tier: SubscriptionTier;
    };
    CompositeTypes: Record<string, never>;
  };
}

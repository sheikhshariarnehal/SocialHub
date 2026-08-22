/**
 * Platform Adapter Abstraction Layer
 * Allows SocialHub to integrate any social network with a unified interface.
 */

import type { PlatformType } from "@/lib/database.types";

export interface PlatformProfile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  followerCount?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  tokenExpiresAt?: Date;
}

export interface PostPayload {
  content: string;
  mediaUrls: string[];
  scheduledAt?: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  errorMessage?: string;
}

export interface PlatformComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  postId: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface PlatformAdapter {
  platform: PlatformType;
  getAuthorizationUrl(state: string, redirectUri: string): string;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenPair>;
  refreshTokens(refreshToken: string): Promise<TokenPair>;
  getProfile(accessToken: string): Promise<PlatformProfile>;
  publishPost(accessToken: string, payload: PostPayload): Promise<PublishResult>;
  fetchComments(accessToken: string, postId?: string): Promise<PlatformComment[]>;
  replyToComment(accessToken: string, commentId: string, replyText: string): Promise<boolean>;
}

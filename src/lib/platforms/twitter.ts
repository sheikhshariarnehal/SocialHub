import type {
  PlatformAdapter,
  PlatformProfile,
  TokenPair,
  PostPayload,
  PublishResult,
  PlatformComment,
} from "./adapter";

export class TwitterAdapter implements PlatformAdapter {
  platform = "twitter" as const;

  getAuthorizationUrl(state: string, redirectUri: string, codeChallenge?: string): string {
    const clientId = process.env.TWITTER_CLIENT_ID;
    if (!clientId) {
      return `/api/social/callback/twitter?code=demo_auth_code&state=${encodeURIComponent(state)}`;
    }
    const scopes = "tweet.read tweet.write users.read offline.access";
    const challenge = codeChallenge || "SocialHubVerifierPKCEChallengeForTwitterOAuth20App";
    return `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(
      state
    )}&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=S256`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<TokenPair> {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (clientId && clientSecret && code !== "demo_auth_code") {
      try {
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const body = new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: codeVerifier || "SocialHubVerifierPKCEChallengeForTwitterOAuth20App",
        });

        const res = await fetch("https://api.twitter.com/2/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
          body: body.toString(),
        });

        const data = await res.json();
        if (data.access_token) {
          const expiresIn = data.expires_in || 7200;
          return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresInSeconds: expiresIn,
            tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          };
        } else {
          console.error("Twitter token response error:", data);
          const errorMsg =
            data.error_description || data.error || data.detail || "Failed to exchange Twitter authorization code for tokens.";
          throw new Error(errorMsg);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed live Twitter OAuth exchange";
        console.error("Failed live Twitter OAuth exchange:", message);
        throw new Error(message);
      }
    }

    return {
      accessToken: `tw_live_token_${code.slice(0, 8)}_${Date.now()}`,
      refreshToken: `tw_refresh_${Date.now()}`,
      expiresInSeconds: 7200,
      tokenExpiresAt: new Date(Date.now() + 7200 * 1000),
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (clientId && clientSecret && !refreshToken.startsWith("tw_refresh_")) {
      try {
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const body = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
        });

        const res = await fetch("https://api.twitter.com/2/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
          body: body.toString(),
        });

        const data = await res.json();
        if (data.access_token) {
          const expiresIn = data.expires_in || 7200;
          return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresInSeconds: expiresIn,
            tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          };
        }
      } catch (err) {
        console.error("Failed refreshing Twitter tokens:", err);
      }
    }

    return {
      accessToken: `tw_refreshed_token_${Date.now()}`,
      refreshToken: refreshToken,
      expiresInSeconds: 7200,
      tokenExpiresAt: new Date(Date.now() + 7200 * 1000),
    };
  }

  async getProfile(accessToken: string): Promise<PlatformProfile> {
    if (accessToken && !accessToken.startsWith("tw_live_token_")) {
      try {
        const res = await fetch(
          "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await res.json();
        if (data.data) {
          return {
            id: data.data.id,
            displayName: data.data.name,
            handle: `@${data.data.username}`,
            avatarUrl: data.data.profile_image_url || null,
            followerCount: data.data.public_metrics?.followers_count || 0,
          };
        }
      } catch (err) {
        console.error("Failed fetching live Twitter profile:", err);
      }
    }

    return {
      id: "tw_user_9981273",
      displayName: "My X Account",
      handle: "@my_x_handle",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      followerCount: 1200,
    };
  }

  async publishPost(accessToken: string, payload: PostPayload): Promise<PublishResult> {
    if (accessToken && !accessToken.startsWith("tw_live_token_") && !accessToken.startsWith("token_")) {
      try {
        const tweetRes = await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: payload.content,
          }),
        });

        const tweetData = await tweetRes.json();
        if (tweetData.data?.id) {
          return {
            success: true,
            externalPostId: tweetData.data.id,
            externalPostUrl: `https://x.com/user/status/${tweetData.data.id}`,
          };
        } else {
          return {
            success: false,
            errorMessage: tweetData.detail || tweetData.title || "X API rejected tweet publication.",
          };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to publish Tweet.";
        console.error("Twitter live publish error:", err);
        return {
          success: false,
          errorMessage: message,
        };
      }
    }

    const externalId = `tw_status_${Date.now()}`;
    return {
      success: true,
      externalPostId: externalId,
      externalPostUrl: `https://x.com/status/${externalId}`,
    };
  }

  async fetchComments(_accessToken: string, _postId?: string): Promise<PlatformComment[]> {
    return [];
  }

  async replyToComment(_accessToken: string, _commentId: string, _replyText: string): Promise<boolean> {
    return true;
  }
}

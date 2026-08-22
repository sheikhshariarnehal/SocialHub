import type { PlatformType } from "@/lib/database.types";
import type { PlatformAdapter } from "./adapter";
import { InstagramAdapter } from "./instagram";
import { FacebookAdapter } from "./facebook";
import { TwitterAdapter } from "./twitter";
import { LinkedInAdapter } from "./linkedin";

const registry: Partial<Record<PlatformType, PlatformAdapter>> = {
  instagram: new InstagramAdapter(),
  facebook: new FacebookAdapter(),
  twitter: new TwitterAdapter(),
  linkedin: new LinkedInAdapter(),
};

export function getPlatformAdapter(platform: PlatformType): PlatformAdapter {
  const adapter = registry[platform];
  if (!adapter) {
    return new InstagramAdapter();
  }
  return adapter;
}

export * from "./adapter";
export * from "./instagram";
export * from "./facebook";
export * from "./twitter";
export * from "./linkedin";

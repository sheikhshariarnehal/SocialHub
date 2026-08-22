import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Uses clsx for conditional classes + tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with compact notation (1.2K, 3.5M, etc.)
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Generate initials from a name (e.g., "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Platform display names and colors
 */
export const PLATFORM_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  instagram: { label: "Instagram", color: "var(--platform-instagram)", icon: "instagram" },
  facebook: { label: "Facebook", color: "var(--platform-facebook)", icon: "facebook" },
  twitter: { label: "X (Twitter)", color: "var(--platform-twitter)", icon: "twitter" },
  linkedin: { label: "LinkedIn", color: "var(--platform-linkedin)", icon: "linkedin" },
  tiktok: { label: "TikTok", color: "var(--platform-tiktok)", icon: "music" },
  youtube: { label: "YouTube", color: "var(--platform-youtube)", icon: "youtube" },
  pinterest: { label: "Pinterest", color: "var(--platform-pinterest)", icon: "pin" },
  threads: { label: "Threads", color: "var(--platform-threads)", icon: "at-sign" },
};

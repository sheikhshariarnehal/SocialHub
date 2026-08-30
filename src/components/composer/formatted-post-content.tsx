"use client";

import React from "react";

interface FormattedPostContentProps {
  content: string;
  platform?: "linkedin" | "facebook" | "instagram" | "twitter" | string;
  className?: string;
}

export function FormattedPostContent({
  content,
  platform = "linkedin",
  className = "",
}: FormattedPostContentProps) {
  if (!content) {
    return (
      <span className="text-muted-foreground italic">
        Your post caption will appear here in real-time...
      </span>
    );
  }

  const getPlatformColors = () => {
    switch (platform) {
      case "twitter":
        return {
          hashtag: "text-[#1D9BF0] hover:underline font-normal cursor-pointer",
          mention: "text-[#1D9BF0] hover:underline font-normal cursor-pointer",
          link: "text-[#1D9BF0] hover:underline underline cursor-pointer",
        };
      case "facebook":
        return {
          hashtag: "text-[#1877F2] hover:underline font-semibold cursor-pointer",
          mention: "text-[#1877F2] hover:underline font-semibold cursor-pointer",
          link: "text-[#1877F2] hover:underline underline cursor-pointer",
        };
      case "instagram":
        return {
          hashtag: "text-primary/90 hover:underline font-medium cursor-pointer",
          mention: "text-primary/90 hover:underline font-semibold cursor-pointer",
          link: "text-primary hover:underline underline cursor-pointer",
        };
      case "linkedin":
      default:
        return {
          hashtag: "text-[#0A66C2] dark:text-[#70b5f9] hover:underline font-semibold cursor-pointer",
          mention: "text-[#0A66C2] dark:text-[#70b5f9] hover:underline font-semibold cursor-pointer",
          link: "text-[#0A66C2] dark:text-[#70b5f9] hover:underline underline cursor-pointer",
        };
    }
  };

  const colors = getPlatformColors();

  // Helper to parse line segments for **bold**, *italic*, #hashtags, @mentions, URLs
  const parseLine = (line: string, lineKey: number) => {
    // Regex for markdown tokens + hashtags + mentions + URLs
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+|#[a-zA-Z0-9_\u0080-\uFFFF]+|@[a-zA-Z0-9_]+)/g;

    const parts = line.split(tokenRegex);

    return (
      <span key={lineKey}>
        {parts.map((part, pIdx) => {
          if (!part) return null;

          // **Bold**
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            const inner = part.slice(2, -2);
            return (
              <strong key={pIdx} className="font-bold text-foreground">
                {inner}
              </strong>
            );
          }

          // *Italic*
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            const inner = part.slice(1, -1);
            return (
              <em key={pIdx} className="italic text-foreground">
                {inner}
              </em>
            );
          }

          // #Hashtag
          if (part.startsWith("#") && part.length > 1) {
            return (
              <span key={pIdx} className={colors.hashtag}>
                {part}
              </span>
            );
          }

          // @Mention
          if (part.startsWith("@") && part.length > 1) {
            return (
              <span key={pIdx} className={colors.mention}>
                {part}
              </span>
            );
          }

          // URL Link
          if (part.startsWith("http://") || part.startsWith("https://")) {
            return (
              <span key={pIdx} className={colors.link}>
                {part}
              </span>
            );
          }

          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        })}
      </span>
    );
  };

  const lines = content.split("\n");

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {parseLine(line, idx)}
          {idx < lines.length - 1 && "\n"}
        </React.Fragment>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import {
  Bold,
  Italic,
  Sparkles,
  Smile,
  Hash,
  List,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Convert regular ASCII chars to Unicode Sans-Serif Bold (A-Z, a-z, 0-9)
export function toUnicodeBold(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + (code - 65)); // 𝗔-𝗭
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + (code - 97)); // 𝗮-𝘇
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + (code - 48)); // 𝟬-𝟵
    return char;
  });
}

// Convert regular ASCII chars to Unicode Sans-Serif Italic
export function toUnicodeItalic(text: string): string {
  return text.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d608 + (code - 65)); // 𝘈-𝘡
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d622 + (code - 97)); // 𝘢-𝘻
    return char;
  });
}

// Clean markdown syntax (**, *, #) for clean social posting
export function cleanMarkdownSyntax(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Strip **bold**
    .replace(/\*(.*?)\*/g, "$1") // Strip *italic*
    .replace(/^#+\s+/gm, "") // Strip ## Headings
    .replace(/_{2}(.*?)_{2}/g, "$1")
    .replace(/_(.*?)_/g, "$1");
}

interface CaptionToolbarProps {
  content: string;
  onChange: (newContent: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

const QUICK_EMOJIS = ["🚀", "💡", "✨", "📈", "🔥", "👇", "🎯", "🙌", "🔹", "⚡️"];

export function CaptionToolbar({
  content,
  onChange,
  textareaRef,
}: CaptionToolbarProps) {
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      onChange(content + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const updated = before + textToInsert + after;
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + textToInsert.length,
        start + textToInsert.length
      );
    }, 0);
  };

  const handleTransformSelection = (
    transform: (selected: string) => string,
    fallbackText: string
  ) => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      onChange(content + transform(fallbackText));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    if (!selected) {
      // If nothing selected, clean or transform whole content or insert fallback
      insertTextAtCursor(transform(fallbackText));
      return;
    }

    const transformed = transform(selected);
    const before = content.substring(0, start);
    const after = content.substring(end);
    const updated = before + transformed + after;

    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 0);
  };

  const handleCleanMarkdown = () => {
    if (!content.includes("**") && !content.includes("##") && !content.includes("*")) {
      toast.info("No markdown asterisks found in caption.");
      return;
    }
    const cleaned = cleanMarkdownSyntax(content);
    onChange(cleaned);
    toast.success("Cleaned markdown asterisks (**) for social media!");
  };

  const hasAsterisks = content.includes("**") || content.includes("##");

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs text-xs">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Unicode Bold */}
        <button
          type="button"
          onClick={() =>
            handleTransformSelection(toUnicodeBold, "Bold Heading")
          }
          className="h-7 px-2 rounded-lg hover:bg-muted/80 text-foreground font-bold flex items-center gap-1 text-[11px] transition-colors border border-border/40"
          title="Convert selection to Unicode Bold (Works on LinkedIn & Twitter)"
        >
          <Bold className="h-3.5 w-3.5" />
          <span>Bold</span>
        </button>

        {/* Unicode Italic */}
        <button
          type="button"
          onClick={() =>
            handleTransformSelection(toUnicodeItalic, "Italic Text")
          }
          className="h-7 px-2 rounded-lg hover:bg-muted/80 text-foreground italic flex items-center gap-1 text-[11px] transition-colors border border-border/40"
          title="Convert selection to Unicode Italic"
        >
          <Italic className="h-3.5 w-3.5" />
          <span>Italic</span>
        </button>

        {/* Diamond Bullet */}
        <button
          type="button"
          onClick={() => insertTextAtCursor("\n🔹 ")}
          className="h-7 px-2 rounded-lg hover:bg-muted/80 text-foreground flex items-center gap-1 text-[11px] transition-colors border border-border/40"
          title="Insert Diamond Bullet"
        >
          <span>🔹 Bullet</span>
        </button>

        {/* Clean Markdown Asterisks Button */}
        {hasAsterisks && (
          <button
            type="button"
            onClick={handleCleanMarkdown}
            className="h-7 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1 text-[11px] font-medium transition-colors animate-pulse"
            title="Clean raw ** markdown asterisks for social posting"
          >
            <Sparkles className="h-3 w-3" />
            <span>Clean Asterisks (**)</span>
          </button>
        )}
      </div>

      {/* Quick Emojis */}
      <div className="flex items-center gap-0.5 overflow-x-auto py-0.5">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => insertTextAtCursor(emoji)}
            className="h-7 w-7 rounded-lg hover:bg-muted/80 flex items-center justify-center text-sm transition-transform active:scale-90"
            title={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

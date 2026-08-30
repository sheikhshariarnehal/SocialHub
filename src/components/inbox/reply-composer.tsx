"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAIProvidersStore } from "@/hooks/use-ai-providers";

export function ReplyComposer({
  parentAuthor,
  parentContent,
  onSend,
  onCancel,
}: {
  parentAuthor: string;
  parentContent: string;
  onSend: (replyText: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { getActiveProvider } = useAIProvidersStore();
  const activeProvider = getActiveProvider();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAiReply = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          prompt: `Reply to ${parentAuthor}: "${parentContent}"`,
          provider: activeProvider.providerType,
          apiKey: activeProvider.apiKey,
          model: activeProvider.defaultModel,
          baseUrl: activeProvider.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.generatedText) {
        setText(data.generatedText);
        toast.success(`AI reply generated with ${data.providerUsed}!`);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch {
      setText(`Thanks @${parentAuthor}! Great point — we appreciate your feedback! 🙌`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-3.5 space-y-3 shadow-md animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Replying to <span className="text-foreground">{parentAuthor}</span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10"
          isLoading={isGenerating}
          onClick={handleGenerateAiReply}
        >
          <Sparkles className="h-3 w-3" />
          AI Suggest Reply
        </Button>
      </div>

      <Textarea
        placeholder="Type your response..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[80px] text-xs"
        autoFocus
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="brand"
          size="sm"
          className="h-8 text-xs gap-1.5"
          isLoading={isSending}
          onClick={handleSend}
        >
          <Send className="h-3.5 w-3.5" />
          Send Reply
        </Button>
      </div>
    </div>
  );
}

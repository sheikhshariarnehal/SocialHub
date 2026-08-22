"use client";

import { useState } from "react";
import { Clock, Calendar, Zap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OPTIMAL_TIMES = [
  { label: "Today 2:00 PM", desc: "Peak LinkedIn activity", date: "2026-08-22", time: "14:00" },
  { label: "Tomorrow 9:00 AM", desc: "High X / Twitter reach", date: "2026-08-23", time: "09:00" },
  { label: "Tomorrow 6:30 PM", desc: "Peak Instagram engagement", date: "2026-08-23", time: "18:30" },
];

export function SchedulePicker({
  publishImmediately,
  scheduledDate,
  scheduledTime,
  onPublishModeChange,
  onDateChange,
  onTimeChange,
}: {
  publishImmediately: boolean;
  scheduledDate: string;
  scheduledTime: string;
  onPublishModeChange: (immediately: boolean) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Publish Timing
        </span>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPublishModeChange(false)}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
            !publishImmediately
              ? "border-primary bg-primary/10 text-foreground font-semibold"
              : "border-border bg-card/40 text-muted-foreground hover:bg-card"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule Later
        </button>

        <button
          type="button"
          onClick={() => onPublishModeChange(true)}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
            publishImmediately
              ? "border-primary bg-primary/10 text-foreground font-semibold"
              : "border-border bg-card/40 text-muted-foreground hover:bg-card"
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-warning" />
          Publish Immediately
        </button>
      </div>

      {/* Date & Time Selectors */}
      {!publishImmediately && (
        <div className="space-y-3 pt-1 animate-in fade-in-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="schedDate">Date</Label>
              <Input
                id="schedDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="schedTime">Time</Label>
              <Input
                id="schedTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => onTimeChange(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* AI Recommended Optimal Times */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Recommended posting times for your audience:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OPTIMAL_TIMES.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    onDateChange(opt.date);
                    onTimeChange(opt.time);
                  }}
                  className="rounded-lg border border-border/70 bg-card/80 px-2 py-1 text-[10px] text-foreground hover:border-primary hover:bg-accent transition-colors"
                >
                  <span className="font-semibold">{opt.label}</span> · {opt.desc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

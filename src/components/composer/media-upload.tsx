"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

const DEMO_MEDIA_PRESETS = [
  {
    id: "demo-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    type: "image" as const,
    name: "abstract-wave.jpg",
  },
  {
    id: "demo-2",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    type: "image" as const,
    name: "team-workspace.jpg",
  },
  {
    id: "demo-3",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    type: "image" as const,
    name: "analytics-chart.jpg",
  },
];

export function MediaUpload({
  media,
  onChange,
}: {
  media: MediaFile[];
  onChange: (media: MediaFile[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleAddDemo = (preset: typeof DEMO_MEDIA_PRESETS[0]) => {
    if (media.some((m) => m.id === preset.id)) return;
    onChange([...media, preset]);
  };

  const handleRemove = (id: string) => {
    onChange(media.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          // In real production, handle actual file drag & drop + Supabase storage upload
          handleAddDemo(DEMO_MEDIA_PRESETS[0]);
        }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border/80 bg-card/30 hover:bg-card/60 hover:border-border"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary mb-2">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-foreground">
          Drag & drop media, or click to upload
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          PNG, JPG, MP4, GIF up to 50MB (Instagram 1:1 / 4:5, X 16:9)
        </p>

        {/* Quick sample media insert */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Add sample asset:
          </span>
          {DEMO_MEDIA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleAddDemo(preset)}
              className="rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
            >
              + {preset.name.split(".")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Thumbnails Carousel */}
      {media.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-all hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

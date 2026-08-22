"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Film,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  size?: number;
}

const DEMO_MEDIA_PRESETS = [
  {
    id: "demo-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    type: "image" as const,
    name: "abstract-wave.jpg",
  },
  {
    id: "demo-2",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    type: "image" as const,
    name: "team-workspace.jpg",
  },
  {
    id: "demo-3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "video" as const,
    name: "sample-demo.mp4",
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
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      const isImg = file.type.startsWith("image/");
      const isVid = file.type.startsWith("video/");
      if (!isImg && !isVid) {
        toast.error(`"${file.name}" is not a supported image or video.`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 100MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingCount((prev) => prev + validFiles.length);
    const supabase = createClient();
    const uploadedMedia: MediaFile[] = [];

    for (const file of validFiles) {
      try {
        const isVideo = file.type.startsWith("video/");
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `uploads/${Date.now()}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          // If storage bucket upload has permission/network issue, fallback to blob preview
          console.warn("Storage upload fallback:", uploadError.message);
          const localUrl = URL.createObjectURL(file);
          uploadedMedia.push({
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: localUrl,
            type: isVideo ? "video" : "image",
            name: file.name,
            size: file.size,
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("post-media")
            .getPublicUrl(filePath);

          uploadedMedia.push({
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: publicUrlData.publicUrl,
            type: isVideo ? "video" : "image",
            name: file.name,
            size: file.size,
          });
        }
      } catch (err) {
        console.error("File upload error:", err);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingCount((prev) => Math.max(0, prev - 1));
      }
    }

    if (uploadedMedia.length > 0) {
      onChange([...media, ...uploadedMedia]);
      toast.success(
        `Attached ${uploadedMedia.length} media file${uploadedMedia.length > 1 ? "s" : ""}!`
      );
    }
  };

  const handleAddPreset = (preset: typeof DEMO_MEDIA_PRESETS[0]) => {
    if (media.some((m) => m.url === preset.url)) {
      toast.info("This asset is already attached.");
      return;
    }
    onChange([...media, preset]);
    toast.success(`Added ${preset.name}`);
  };

  const handleRemove = (id: string) => {
    onChange(media.filter((m) => m.id !== id));
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    const newMedia = [...media];
    const [moved] = newMedia.splice(index, 1);
    newMedia.splice(targetIndex, 0, moved);
    onChange(newMedia);
  };

  return (
    <div className="space-y-4">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* Interactive Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/15 scale-[1.01] shadow-md shadow-primary/10"
            : "border-border/70 bg-card/40 hover:bg-card/70 hover:border-primary/50"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
          {uploadingCount > 0 ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>

        <p className="text-xs sm:text-sm font-semibold text-foreground">
          {uploadingCount > 0
            ? `Uploading ${uploadingCount} file${uploadingCount > 1 ? "s" : ""}...`
            : "Click to upload, or drag & drop media"}
        </p>

        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
          Images (PNG, JPG, WebP, GIF) & Videos (MP4, WebM, QuickTime) up to 100MB
        </p>

        {/* Quick sample assets */}
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-border/40 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Quick Presets:
          </span>
          {DEMO_MEDIA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
            >
              {preset.type === "video" ? (
                <Film className="h-2.5 w-2.5 text-info" />
              ) : (
                <ImageIcon className="h-2.5 w-2.5 text-primary" />
              )}
              {preset.name.split(".")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Media Gallery / Management */}
      {media.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Attached Media ({media.length})
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              Drag or use arrows to reorder carousel sequence
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {media.map((item, idx) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col"
              >
                {/* Thumbnail / Video Container */}
                <div className="relative aspect-video w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {item.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <div className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                          <Play className="h-4 w-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                  {/* Type Badge */}
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    {item.type === "video" ? (
                      <>
                        <Film className="h-2.5 w-2.5 text-info" /> Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-2.5 w-2.5 text-primary" /> Image
                      </>
                    )}
                  </span>

                  {/* Order Badge */}
                  <span className="absolute left-1.5 bottom-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                    #{idx + 1}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-all hover:bg-destructive hover:scale-110"
                    title="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Footer Controls & File Details */}
                <div className="p-2 flex items-center justify-between gap-1 text-xs border-t border-border/50 bg-card/60">
                  <p className="truncate text-[11px] font-medium text-foreground max-w-[100px]">
                    {item.name}
                  </p>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "left")}
                      className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move left"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === media.length - 1}
                      onClick={() => handleMove(idx, "right")}
                      className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move right"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ExternalLink, Minus, Plus, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  alt: string;
  title: string;
  description?: string;
}

export function ImagePreviewModal({
  open,
  onOpenChange,
  src,
  alt,
  title,
  description = "Gunakan tombol zoom untuk memeriksa detail gambar.",
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  if (!src) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setZoom(1);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-0 text-slate-900 shadow-[0_24px_80px_rgba(15,59,112,0.18)]">
        <DialogHeader className="border-b border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="text-base font-black text-slate-950">{title}</DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-600">{description}</DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-[min(58vh,520px)] items-center justify-center overflow-hidden bg-slate-50 p-4 sm:p-8">
          <div className="flex h-full min-h-[min(50vh,440px)] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 shadow-inner sm:p-6">
          {/* Remote storage URLs are user-provided and cannot be statically configured for next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
              src={src}
              alt={alt}
              className="max-h-[min(48vh,440px)] max-w-full select-none rounded-xl object-contain shadow-md transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Kontrol zoom gambar">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-blue-100 bg-white text-[#0D47A1] hover:bg-blue-50 hover:text-[#0D47A1] focus-visible:ring-[#0D47A1]/30"
              onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
              disabled={zoom <= 1}
              aria-label="Perkecil gambar"
            >
              <Minus />
            </Button>
            <span className="min-w-14 rounded-lg bg-white px-2 py-1.5 text-center text-xs font-black text-slate-700">{Math.round(zoom * 100)}%</span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-blue-100 bg-white text-[#0D47A1] hover:bg-blue-50 hover:text-[#0D47A1] focus-visible:ring-[#0D47A1]/30"
              onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
              disabled={zoom >= 3}
              aria-label="Perbesar gambar"
            >
              <Plus />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 text-[#0D47A1] hover:bg-blue-50 hover:text-[#0D47A1] focus-visible:ring-[#0D47A1]/30"
              onClick={() => setZoom(1)}
            >
              <RotateCcw />
              Reset
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white text-[#0D47A1] hover:border-blue-200 hover:bg-blue-50 hover:text-[#0D47A1] focus-visible:ring-[#0D47A1]/30"
            asChild
          >
            <a href={src} target="_blank" rel="noreferrer">
              <ExternalLink />
              Buka tab baru
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

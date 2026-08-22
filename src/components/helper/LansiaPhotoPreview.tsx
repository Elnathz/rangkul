"use client";

import * as React from "react";
import { Image as ImageIcon, ZoomIn } from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";

export function LansiaPhotoPreview({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "L";

  return (
    <>
      <button
        type="button"
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-slate-100 to-emerald-100 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
        onClick={() => src && !failed && setOpen(true)}
        disabled={!src || failed}
        aria-label={src && !failed ? `Buka foto ${name}` : `Foto ${name} belum tersedia`}
      >
        {src && !failed ? (
          <img
            src={src}
            alt={`Foto ${name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#0D47A1]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-3xl font-black shadow-sm">{initials}</div>
            <span className="text-sm font-semibold">Foto lansia belum tersedia</span>
          </div>
        )}
        {src && !failed && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition group-hover:bg-[#0D47A1]">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
            Klik untuk memperbesar
          </span>
        )}
        {!src && !failed && (
          <ImageIcon className="absolute right-4 top-4 h-5 w-5 text-white/70" aria-hidden="true" />
        )}
      </button>
      <ImagePreviewModal
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={`Foto ${name}`}
        title={`Foto ${name}`}
      />
    </>
  );
}

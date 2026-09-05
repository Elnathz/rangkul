"use client";

import { Loader2, Lock } from "lucide-react";
import { useSignedFile } from "@/hooks/use-signed-file";

type SignedImageProps = {
  path: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export function SignedImage({ path, alt, className, fallbackClassName }: SignedImageProps) {
  const { url, status } = useSignedFile(path);

  if (status === "loading") {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${fallbackClassName ?? ""}`}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400 ${fallbackClassName ?? ""}`}>
        <Lock className="h-5 w-5" />
        <span className="text-xs">Tidak berhak</span>
      </div>
    );
  }

  if (status === "error" || !url) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${fallbackClassName ?? ""}`}>
        <span className="text-xs">Dokumen tidak tersedia</span>
      </div>
    );
  }

  return <img src={url} alt={alt} className={className} />;
}
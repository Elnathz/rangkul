"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1] mb-2" />
      <span className="text-sm font-medium">Memuat Peta Lokasi...</span>
    </div>
  ),
});

interface LocationPickerProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (pos: { lat: number; lng: number }, address?: string) => void;
  defaultCenter?: { lat: number; lng: number };
}

export default function LocationPicker(props: LocationPickerProps) {
  return <Map {...props} />;
}

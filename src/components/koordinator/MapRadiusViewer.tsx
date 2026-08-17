"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapViewer = dynamic(() => import("./MapRadiusViewerInternal"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1] mb-2" />
      <span className="text-sm font-medium">Memuat Peta Jangkauan...</span>
    </div>
  ),
});

interface MapRadiusViewerProps {
  lat: number;
  lng: number;
  radiusKm: number;
}

export default function MapRadiusViewer(props: MapRadiusViewerProps) {
  return <MapViewer {...props} />;
}

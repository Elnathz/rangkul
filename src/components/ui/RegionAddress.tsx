import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRegionName, parseRegionAddress } from "@/lib/region-address";

type RegionAddressProps = {
  value: string | null | undefined;
  tone?: "default" | "inverse";
  compact?: boolean;
};

export function RegionAddress({ value, tone = "default", compact = false }: RegionAddressProps) {
  const parsed = parseRegionAddress(value);
  const isInverse = tone === "inverse";

  if (!value?.trim()) {
    return <span className={cn("text-xs sm:text-sm", isInverse ? "text-white/70" : "text-slate-500")}>Wilayah belum tersedia</span>;
  }

  const primaryPart = [formatRegionName(parsed.kelurahan), formatRegionName(parsed.kecamatan)].filter(Boolean).join(", ");
  const secondaryPart = [formatRegionName(parsed.kotaKabupaten), formatRegionName(parsed.provinsi)].filter(Boolean).join(", ");
  const rtRw = parsed.rt && parsed.rw ? `RT ${parsed.rt}/RW ${parsed.rw}` : "";

  return (
    <div className={cn("flex min-w-0 items-start gap-1.5 sm:gap-2", compact ? "text-xs" : "text-sm")} title={value}>
      <MapPin className={cn("mt-0.5 shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4", isInverse ? "text-white/85" : "text-[#0D47A1]")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="space-y-1">
          {primaryPart && (
            <span
              className={cn(
                "block font-bold leading-snug",
                isInverse ? "text-white" : "text-ink",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {primaryPart}
            </span>
          )}
          {secondaryPart ? (
            <span
              className={cn(
                "block min-w-0 break-words font-medium leading-snug",
                isInverse ? "text-white/90" : "text-slate-700",
                compact ? "text-[11px]" : "text-xs"
              )}
            >
              {secondaryPart}
            </span>
          ) : null}
          {rtRw ? <span className={cn("block font-semibold", compact ? "text-[11px]" : "text-xs", isInverse ? "text-white/80" : "text-primary")}>{rtRw}</span> : null}
        </div>
        {parsed.detail && (
          <p className={cn("mt-1 break-words leading-relaxed", compact ? "text-[11px]" : "text-xs", isInverse ? "text-white/75" : "text-slate-500")}>
            {formatRegionName(parsed.detail)}
          </p>
        )}
      </div>
    </div>
  );
}

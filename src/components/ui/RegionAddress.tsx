import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { getRegionParts, parseRegionAddress } from "@/lib/region-address";

type RegionAddressProps = {
  value: string | null | undefined;
  tone?: "default" | "inverse";
  compact?: boolean;
};

export function RegionAddress({ value, tone = "default", compact = false }: RegionAddressProps) {
  const parsed = parseRegionAddress(value);
  const parts = getRegionParts(value);
  const isInverse = tone === "inverse";

  if (!value?.trim()) {
    return <span className={cn("text-xs sm:text-sm", isInverse ? "text-white/70" : "text-slate-500")}>Wilayah belum tersedia</span>;
  }

  const primaryPart = parts[0];
  const secondaryPart = parts.slice(1).join(", ");

  return (
    <div className={cn("flex min-w-0 items-start gap-1.5 sm:gap-2", compact ? "text-xs" : "text-sm")} title={value}>
      <MapPin className={cn("mt-0.5 shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4", isInverse ? "text-white/85" : "text-[#0D47A1]")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {primaryPart && (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 font-bold leading-tight shrink-0",
                isInverse
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-blue-200 bg-blue-50 text-[#0D47A1]",
                compact ? "text-[11px]" : "text-xs"
              )}
            >
              {primaryPart}
            </span>
          )}
          {secondaryPart ? (
            <span
              className={cn(
                "font-medium leading-tight break-words min-w-0",
                isInverse ? "text-white/90" : "text-slate-700",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {secondaryPart}
            </span>
          ) : null}
        </div>
        {parsed.detail && (
          <p className={cn("mt-1 break-words leading-relaxed", compact ? "text-[11px]" : "text-xs", isInverse ? "text-white/75" : "text-slate-500")}>
            Detail: {parsed.detail}
          </p>
        )}
      </div>
    </div>
  );
}

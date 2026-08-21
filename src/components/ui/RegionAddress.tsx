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
    return <span className={cn("text-sm", isInverse ? "text-white/70" : "text-slate-500")}>Wilayah belum tersedia</span>;
  }

  return (
    <div className={cn("flex min-w-0 items-start gap-2", compact ? "text-xs" : "text-sm")} title={value}>
      <MapPin className={cn("mt-0.5 shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4", isInverse ? "text-white/85" : "text-[#0D47A1]")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {parts.map((part, index) => (
            <span
              key={`${part}-${index}`}
              className={cn(
                "max-w-full rounded-full border px-2 py-0.5 font-semibold leading-relaxed",
                isInverse
                  ? "border-white/20 bg-white/10 text-white"
                  : index === 0
                    ? "border-blue-100 bg-blue-50 text-[#0D47A1]"
                    : "border-slate-200 bg-white text-slate-700",
              )}
            >
              <span className="break-words">{part}</span>
            </span>
          ))}
        </div>
        {parsed.detail && (
          <p className={cn("mt-1.5 break-words leading-relaxed", compact ? "text-[11px]" : "text-xs", isInverse ? "text-white/75" : "text-slate-500")}>
            Detail: {parsed.detail}
          </p>
        )}
      </div>
    </div>
  );
}

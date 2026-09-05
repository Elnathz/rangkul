"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export type ServiceCategoryItem = {
  id: string;
  nama: string;
  tingkat: "ringan" | "sedang" | "berat" | string;
  is_high_risk?: boolean;
};

type ServiceTiersTabsProps = {
  categories: ServiceCategoryItem[];
};

type TierKey = "ringan" | "sedang" | "berat";

const tierConfig: Record<TierKey, {
  label: string;
  subtitle: string;
  activeTabClass: string;
  badgeClass: string;
  cardClass: string;
  chipClass: string;
}> = {
  ringan: {
    label: "Tingkat Ringan",
    subtitle: "Pendampingan sosial, empati, dan kehadiran emosional.",
    activeTabClass: "bg-emerald-700 text-white shadow-xs font-bold",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardClass: "border-emerald-200/80 bg-emerald-50/40",
    chipClass: "border-emerald-200 bg-white text-emerald-950",
  },
  sedang: {
    label: "Tingkat Sedang",
    subtitle: "Bantuan aktivitas harian, mobilitas, dan logistik sekitar.",
    activeTabClass: "bg-blue-700 text-white shadow-xs font-bold",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    cardClass: "border-blue-200/80 bg-blue-50/40",
    chipClass: "border-blue-200 bg-white text-blue-950",
  },
  berat: {
    label: "Tingkat Berat",
    subtitle: "Tugas fisik penuh dan pengawasan kontrol faskes.",
    activeTabClass: "bg-amber-700 text-white shadow-xs font-bold",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    cardClass: "border-amber-200/80 bg-amber-50/40",
    chipClass: "border-amber-200 bg-white text-amber-950",
  },
};

export function ServiceTiersTabs({ categories }: ServiceTiersTabsProps) {
  const [activeTier, setActiveTier] = useState<TierKey>("ringan");

  const byTier: Record<TierKey, ServiceCategoryItem[]> = {
    ringan: categories.filter((c) => (c.tingkat ?? "ringan") === "ringan"),
    sedang: categories.filter((c) => c.tingkat === "sedang"),
    berat: categories.filter((c) => c.tingkat === "berat"),
  };

  const activeConfig = tierConfig[activeTier];
  const activeItems = byTier[activeTier];

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum memilih layanan aktif.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Pilihan tingkat layanan aktif"
        className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-subtle)] p-1 border border-border/70"
      >
        {(["ringan", "sedang", "berat"] as const).map((tier) => {
          const config = tierConfig[tier];
          const count = byTier[tier].length;
          const isActive = activeTier === tier;

          return (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tier-panel-${tier}`}
              id={`tier-tab-${tier}`}
              onClick={() => setActiveTier(tier)}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? config.activeTabClass
                  : "text-muted-foreground hover:bg-white hover:text-foreground font-medium"
              }`}
            >
              <span>{config.label.replace("Tingkat ", "")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tier-panel-${activeTier}`}
        aria-labelledby={`tier-tab-${activeTier}`}
        className={`rounded-xl border p-3.5 transition-colors ${activeConfig.cardClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${activeConfig.badgeClass}`}>
            {activeConfig.label}
          </span>
          <span className="text-[11px] text-muted-foreground">{activeConfig.subtitle}</span>
        </div>

        {activeItems.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {activeItems.map((cat) => (
              <span
                key={cat.id}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-2xs ${activeConfig.chipClass}`}
              >
                {cat.nama}
                {cat.is_high_risk ? (
                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-900">
                    <ShieldAlert className="size-3" aria-hidden="true" />
                    Approval Koordinator
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Tidak ada layanan aktif di tingkatan ini.</p>
        )}
      </div>
    </div>
  );
}

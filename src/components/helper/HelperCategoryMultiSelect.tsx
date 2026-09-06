"use client";

import * as React from "react";
import { Search, X, Check, Clock, Sparkles, AlertCircle } from "lucide-react";
import type { SelectableServiceCategory } from "@/lib/service-category-tree";

export type HelperCategoryItem = SelectableServiceCategory & {
  harga_dasar?: number;
  estimasi_durasi_menit?: number;
  is_high_risk?: boolean;
};

type TingkatTabKey = "semua" | "ringan" | "sedang" | "berat";
type TingkatKey = "ringan" | "sedang" | "berat";

const TIER_META: Record<
  TingkatKey,
  {
    title: string;
    durationLabel: string;
    badgeClass: string;
    dotClass: string;
    activeTabClass: string;
    desc: string;
  }
> = {
  ringan: {
    title: "Ringan",
    durationLabel: "hingga 30 menit",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    activeTabClass: "bg-emerald-700 text-white shadow-xs",
    desc: "Pendampingan ringan dan non-invasif durasi singkat.",
  },
  sedang: {
    title: "Sedang",
    durationLabel: "31 sampai 60 menit",
    badgeClass: "bg-blue-50 text-[#0D47A1] border-blue-200/80",
    dotClass: "bg-[#0D47A1]",
    activeTabClass: "bg-[#0D47A1] text-white shadow-xs",
    desc: "Pendampingan harian reguler dan kebutuhan standar lansia.",
  },
  berat: {
    title: "Berat",
    durationLabel: "lebih dari 60 menit",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
    dotClass: "bg-amber-500",
    activeTabClass: "bg-amber-700 text-white shadow-xs",
    desc: "Aktivitas intensif atau pendampingan ke fasilitas kesehatan. Memerlukan persetujuan Koordinator wilayah.",
  },
};

interface HelperCategoryMultiSelectProps {
  categories: HelperCategoryItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function HelperCategoryMultiSelect({
  categories,
  selectedIds,
  onChange,
}: HelperCategoryMultiSelectProps) {
  const [activeTab, setActiveTab] = React.useState<TingkatTabKey>("semua");
  const [searchQuery, setSearchQuery] = React.useState("");

  const counts = React.useMemo(() => {
    return {
      semua: categories.length,
      ringan: categories.filter((c) => (c.tingkat || "ringan") === "ringan").length,
      sedang: categories.filter((c) => c.tingkat === "sedang").length,
      berat: categories.filter((c) => c.tingkat === "berat").length,
    };
  }, [categories]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => {
      const matchTab = activeTab === "semua" || cat.tingkat === activeTab;
      if (!matchTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cat.nama.toLowerCase().includes(q) ||
        (cat.parentName && cat.parentName.toLowerCase().includes(q))
      );
    });
  }, [categories, activeTab, searchQuery]);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAllInActiveTab = () => {
    const activeIds = filteredCategories.map((c) => c.id);
    const newIds = Array.from(new Set([...selectedIds, ...activeIds]));
    onChange(newIds);
  };

  const deselectAllInActiveTab = () => {
    const activeIds = new Set(filteredCategories.map((c) => c.id));
    onChange(selectedIds.filter((id) => !activeIds.has(id)));
  };

  const removeSelectedId = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const selectedCategoriesList = React.useMemo(() => {
    return categories.filter((c) => selectedIds.includes(c.id));
  }, [categories, selectedIds]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama layanan..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#0D47A1] focus:bg-white focus:outline-hidden"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label="Hapus pencarian"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tier Filter Tabs */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setActiveTab("semua")}
          className={`flex min-h-[44px] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "semua"
              ? "border-[#0D47A1] bg-[#0D47A1] text-white shadow-xs"
              : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
          }`}
        >
          <span>Semua</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "semua" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {counts.semua}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ringan")}
          className={`flex min-h-[44px] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "ringan"
              ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
              : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span
              className={`size-2 shrink-0 rounded-full ${
                activeTab === "ringan" ? "bg-white" : "bg-emerald-500"
              }`}
            />
            Ringan
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "ringan" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {counts.ringan}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sedang")}
          className={`flex min-h-[44px] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "sedang"
              ? "border-[#0D47A1] bg-[#0D47A1] text-white shadow-xs"
              : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span
              className={`size-2 shrink-0 rounded-full ${
                activeTab === "sedang" ? "bg-white" : "bg-[#0D47A1]"
              }`}
            />
            Sedang
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "sedang" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {counts.sedang}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("berat")}
          className={`flex min-h-[44px] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "berat"
              ? "border-amber-700 bg-amber-700 text-white shadow-xs"
              : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span
              className={`size-2 shrink-0 rounded-full ${
                activeTab === "berat" ? "bg-white" : "bg-amber-500"
              }`}
            />
            Berat
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "berat" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {counts.berat}
          </span>
        </button>
      </div>

      {/* Contextual Banner */}
      {activeTab === "semua" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs text-slate-700">
          <Sparkles className="size-4 shrink-0 text-[#0D47A1]" />
          <span>
            Menampilkan seluruh {categories.length} layanan pendampingan yang tersedia.
          </span>
        </div>
      )}
      {activeTab === "ringan" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-950">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <span>
            <strong className="font-bold">Tingkat Ringan:</strong> {TIER_META.ringan.desc}
          </span>
        </div>
      )}
      {activeTab === "sedang" && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 text-xs text-blue-950">
          <span className="size-2 shrink-0 rounded-full bg-[#0D47A1]" />
          <span>
            <strong className="font-bold">Tingkat Sedang:</strong> {TIER_META.sedang.desc}
          </span>
        </div>
      )}
      {activeTab === "berat" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            <strong className="font-bold">Tingkat Berat:</strong> {TIER_META.berat.desc}
          </span>
        </div>
      )}

      {/* Action shortcuts */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <span>{filteredCategories.length} layanan ditampilkan</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAllInActiveTab}
            className="font-semibold text-[#0D47A1] hover:underline focus:outline-hidden cursor-pointer"
          >
            Pilih Semua
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={deselectAllInActiveTab}
            className="font-semibold text-slate-500 hover:text-slate-800 hover:underline focus:outline-hidden cursor-pointer"
          >
            Hapus Pilihan
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
        {filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500">
            <p className="font-semibold">Tidak ada layanan ditemukan untuk &ldquo;{searchQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("semua");
              }}
              className="mt-2 font-bold text-[#0D47A1] hover:underline cursor-pointer"
            >
              Reset pencarian
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            const tierKey = (cat.tingkat || "ringan") as TingkatKey;
            const catMeta = TIER_META[tierKey] ?? TIER_META.ringan;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#0D47A1] bg-blue-50/80 shadow-xs ring-1 ring-[#0D47A1]/20"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold leading-snug ${
                      isSelected ? "text-[#0D47A1]" : "text-slate-900"
                    }`}
                  >
                    {cat.nama}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${catMeta.badgeClass}`}
                    >
                      {catMeta.title}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="size-3 text-slate-400" />
                      {cat.estimasi_durasi_menit ?? 30} menit
                    </span>
                    {cat.harga_dasar ? (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-bold text-[#0D47A1]">
                          Rp {Number(cat.harga_dasar).toLocaleString("id-ID")}
                        </span>
                      </>
                    ) : null}
                    {cat.is_high_risk ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[9px] font-bold text-red-700">
                        Risiko Tinggi
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded border transition-all ${
                    isSelected
                      ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Summary Tags */}
      {selectedCategoriesList.length > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold text-[#0D47A1] uppercase tracking-wider">
              Kategori Terpilih ({selectedCategoriesList.length}):
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 focus:outline-hidden cursor-pointer"
            >
              Kosongkan Semua
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {selectedCategoriesList.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0D47A1] shadow-2xs"
              >
                <span>{c.nama}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedId(c.id);
                  }}
                  className="rounded-full p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-800 focus:outline-hidden cursor-pointer"
                  aria-label={`Hapus ${c.nama}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import {
  X,
  Search,
  Check,
  Clock,
  AlertCircle,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  groupSelectableServiceCategories,
  type ServiceCategoryRow,
} from "@/lib/service-category-tree";

export type ServiceModalCategory = {
  id: string;
  nama: string;
  tingkat?: "ringan" | "sedang" | "berat" | string;
  harga_dasar?: number;
  estimasi_durasi_menit?: number;
  is_high_risk?: boolean;
  parent_id?: string | null;
  parentName?: string | null;
  is_active?: boolean;
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
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    activeTabClass: "bg-emerald-700 text-white shadow-xs",
    desc: "Tugas ringan seperti mengobrol, membaca koran, atau pendampingan jalan santai di teras.",
  },
  sedang: {
    title: "Sedang",
    durationLabel: "31 sampai 60 menit",
    badgeClass: "bg-blue-50 text-[#0D47A1] border-blue-200",
    dotClass: "bg-[#0D47A1]",
    activeTabClass: "bg-[#0D47A1] text-white shadow-xs",
    desc: "Tugas harian reguler seperti belanja kebutuhan dapur, pengingat obat, atau makan bersama.",
  },
  berat: {
    title: "Berat",
    durationLabel: "lebih dari 60 menit",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-700",
    activeTabClass: "bg-amber-700 text-white shadow-xs",
    desc: "Pendampingan intensif ke fasilitas kesehatan atau kondisi khusus (memerlukan persetujuan Koordinator).",
  },
};

export interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "single" | "multiple";
  categories: ServiceModalCategory[];
  selectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  title?: string;
  subtitle?: string;
  allowHighRisk?: boolean;
}

export default function ServiceSelectionModal(props: ServiceSelectionModalProps) {
  if (!props.isOpen) return null;

  return <ServiceSelectionDialog {...props} />;
}

function ServiceSelectionDialog({
  isOpen,
  onClose,
  mode = "single",
  categories,
  selectedIds,
  onConfirm,
  title,
  subtitle,
  allowHighRisk = true,
}: ServiceSelectionModalProps) {
  const [activeTab, setActiveTab] = React.useState<TingkatTabKey>("semua");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tempSelected, setTempSelected] = React.useState<string[]>(selectedIds);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter categories by high risk flag
  const allowedCategories = categories.filter((c) => {
    if (!allowHighRisk && (c.is_high_risk || c.tingkat === "berat")) {
      return false;
    }
    return true;
  });

  // Filter categories by activeTab and search query
  const filteredCategories = allowedCategories.filter((c) => {
    const matchesTab =
      activeTab === "semua" || (c.tingkat || "ringan") === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      c.nama.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (c.parentName &&
        c.parentName.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesTab && matchesSearch;
  });

  // Toggle selection
  const handleItemClick = (id: string) => {
    if (mode === "single") {
      setTempSelected([id]);
    } else {
      setTempSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  // Bulk actions for multiple mode
  const selectAllInActiveTab = () => {
    const currentTabIds = filteredCategories.map((c) => c.id);
    setTempSelected((prev) => {
      const merged = new Set([...prev, ...currentTabIds]);
      return Array.from(merged);
    });
  };

  const deselectAllInActiveTab = () => {
    const currentTabIds = new Set(filteredCategories.map((c) => c.id));
    setTempSelected((prev) => prev.filter((id) => !currentTabIds.has(id)));
  };

  const handleApply = () => {
    onConfirm(tempSelected);
    onClose();
  };

  // Hierarchy grouping: group child items under their parent, and consolidate all standalone items into a unified group
  const normalizedRows: ServiceCategoryRow[] = filteredCategories.map((c) => ({
    id: c.id,
    nama: c.nama,
    tingkat: (c.tingkat === "berat"
      ? "berat"
      : c.tingkat === "sedang"
      ? "sedang"
      : "ringan") as "ringan" | "sedang" | "berat",
    parent_id: c.parent_id ?? null,
    is_active: c.is_active ?? true,
    parentName: c.parentName ?? null,
  }));

  const hasParentGroups = normalizedRows.some((c) => !!c.parentName || !!c.parent_id);

  let groupedCategories: Array<{
    key: string;
    parentName: string | null;
    items: typeof filteredCategories;
  }>;

  if (!hasParentGroups) {
    groupedCategories = [
      {
        key: "all-services",
        parentName: null,
        items: filteredCategories,
      },
    ];
  } else {
    const rawGroups = groupSelectableServiceCategories(normalizedRows);
    const parentGroups: Array<{
      key: string;
      parentName: string | null;
      items: typeof filteredCategories;
    }> = [];
    const standaloneItems: typeof filteredCategories = [];

    for (const g of rawGroups) {
      const matchingItems = filteredCategories.filter((cat) =>
        g.items.some((gi) => gi.id === cat.id)
      );

      if (g.parentName) {
        parentGroups.push({
          key: g.key,
          parentName: g.parentName,
          items: matchingItems,
        });
      } else {
        standaloneItems.push(...matchingItems);
      }
    }

    if (standaloneItems.length > 0) {
      parentGroups.push({
        key: "standalone-services",
        parentName: parentGroups.length > 0 ? "Layanan Mandiri / Terbuka" : null,
        items: standaloneItems,
      });
    }

    groupedCategories = parentGroups;
  }

  // Modal titles
  const modalTitle =
    title ||
    (mode === "single"
      ? "Pilih Kategori Layanan"
      : "Kategori Layanan yang Disediakan");
  const modalSubtitle =
    subtitle ||
    (mode === "single"
      ? "Pilih salah satu layanan pendampingan yang tepat untuk lansia tersayang."
      : "Pilih ragam tugas yang sanggup Anda laksanakan dengan aman dan bertanggung jawab.");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-service-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]">
                <LayoutGrid className="size-4" />
              </span>
              <h2
                id="modal-service-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              >
                {modalTitle}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              {modalSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Tutup jendela pemilihan layanan"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Bar with proper icon spacing */}
        <div className="px-5 pt-3 pb-2 sm:px-6 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan (contoh: obat, belanja, mengobrol, puskesmas)..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10.5 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/15 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Bersihkan pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Symmetrical Tabs */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              className={`flex h-8.5 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all shrink-0 ${
                activeTab === "semua"
                  ? "bg-[#0D47A1] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>Semua</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === "semua"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {allowedCategories.length}
              </span>
            </button>

            {(["ringan", "sedang", "berat"] as TingkatKey[]).map((tierKey) => {
              if (!allowHighRisk && tierKey === "berat") return null;
              const meta = TIER_META[tierKey];
              const count = allowedCategories.filter(
                (c) => (c.tingkat || "ringan") === tierKey
              ).length;
              const isTabActive = activeTab === tierKey;

              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setActiveTab(tierKey)}
                  className={`flex h-8.5 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all shrink-0 ${
                    isTabActive
                      ? meta.activeTabClass
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      isTabActive ? "bg-white" : meta.dotClass
                    }`}
                  />
                  <span>{meta.title}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isTabActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Banner / Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-2.5 sm:px-6 bg-slate-50 border-b border-slate-100 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            {activeTab === "semua" ? (
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="size-3.5 text-[#0D47A1] shrink-0" />
                <span>
                  Menampilkan <strong>{filteredCategories.length}</strong>{" "}
                  layanan terdaftar.
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 truncate">
                <span
                  className={`size-2 rounded-full shrink-0 ${TIER_META[activeTab].dotClass}`}
                />
                <span className="truncate">
                  <strong>Tingkat {TIER_META[activeTab].title}</strong> (
                  {TIER_META[activeTab].durationLabel}):{" "}
                  {TIER_META[activeTab].desc}
                </span>
              </span>
            )}
          </div>

          {mode === "multiple" && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={deselectAllInActiveTab}
                className="text-xs text-slate-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                Hapus Semua di Tab
              </button>
              <button
                type="button"
                onClick={selectAllInActiveTab}
                className="text-xs text-[#0D47A1] hover:text-blue-900 font-bold px-2 py-1 rounded-lg hover:bg-blue-100/60 transition-colors"
              >
                Pilih Semua di Tab
              </button>
            </div>
          )}
        </div>

        {/* Categories Grid (Inner Scroll Container) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 bg-white min-h-[260px]">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="size-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Layanan tidak ditemukan
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada layanan yang cocok dengan kata kunci &ldquo;
                {searchQuery}&rdquo; di tab ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("semua");
                }}
                className="mt-2 text-xs font-bold text-[#0D47A1] hover:underline"
              >
                Reset pencarian & tab
              </button>
            </div>
          ) : (
            groupedCategories.map((group) => (
              <section key={group.key} className="space-y-2.5">
                {group.parentName && (
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <span className="size-1.5 rounded-full bg-[#0D47A1]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {group.parentName}
                    </h3>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((cat) => {
                    const isSelected = tempSelected.includes(cat.id);
                    const originalCat = categories.find((c) => c.id === cat.id);
                    const tierKey = (cat.tingkat || "ringan") as TingkatKey;
                    const tierMeta = TIER_META[tierKey] ?? TIER_META.ringan;

                    return (
                      <div
                        key={cat.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleItemClick(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleItemClick(cat.id);
                          }
                        }}
                        className={`group relative flex flex-col justify-between h-full min-h-[96px] rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 ${
                          isSelected
                            ? "border-2 border-[#0D47A1] bg-blue-50/70 shadow-xs ring-1 ring-[#0D47A1]/20"
                            : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs sm:text-sm font-bold leading-snug ${
                                isSelected
                                  ? "text-[#0D47A1]"
                                  : "text-slate-900 group-hover:text-slate-950"
                              }`}
                            >
                              {cat.nama}
                            </p>
                          </div>

                          {/* Indicator (Checkmark / Checkbox / Radio) */}
                          <div
                            className={`flex size-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                              isSelected
                                ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                                : "border-slate-300 bg-white group-hover:border-slate-400"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3.5 stroke-[3]" />
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100/80">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[9px] font-bold ${tierMeta.badgeClass}`}
                          >
                            {tierMeta.title}
                          </span>

                          <span className="flex items-center gap-1 font-medium text-slate-500">
                            <Clock className="size-3 text-slate-400" />
                            {originalCat?.estimasi_durasi_menit ?? 30} mnt
                          </span>

                          {originalCat?.harga_dasar !== undefined && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-bold text-[#0D47A1]">
                                Rp{" "}
                                {Number(originalCat.harga_dasar).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 sm:px-6 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left w-full sm:w-auto">
            {mode === "single" ? (
              tempSelected.length > 0 ? (
                <span>
                  Layanan terpilih:{" "}
                  <strong className="text-[#0D47A1] font-bold">
                    {categories.find((c) => c.id === tempSelected[0])?.nama}
                  </strong>
                </span>
              ) : (
                <span className="text-slate-400">
                  Belum ada layanan yang dipilih
                </span>
              )
            ) : (
              <span>
                Total terpilih:{" "}
                <strong className="text-[#0D47A1] font-bold">
                  {tempSelected.length}
                </strong>{" "}
                dari {allowedCategories.length} kategori
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 rounded-xl px-5 text-xs font-semibold text-slate-700"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={mode === "single" && tempSelected.length === 0}
              className="flex-1 sm:flex-initial h-10 rounded-xl px-6 bg-[#0D47A1] hover:bg-blue-800 text-white text-xs font-bold shadow-sm"
            >
              {mode === "single" ? "Gunakan Layanan Ini" : "Selesai Memilih"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

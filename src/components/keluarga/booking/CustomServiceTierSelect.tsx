"use client";

import * as React from "react";
import { ChevronDown, Check, Clock, AlertCircle, Sparkles, X, Search, LayoutGrid } from "lucide-react";
import ServiceSelectionModal from "@/components/services/ServiceSelectionModal";

export type ServiceCategoryItem = {
  id: string;
  nama: string;
  tingkat?: string;
  harga_dasar: number;
  estimasi_durasi_menit?: number;
  is_high_risk?: boolean;
  parent_id?: string | null;
  parentName?: string | null;
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
    desc: "Aktivitas intensif atau pendampingan ke fasilitas kesehatan. Persetujuan Koordinator diperlukan sebelum kunjungan dijalankan.",
  },
};

interface CustomServiceTierSelectProps {
  categories: ServiceCategoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  label?: string;
  required?: boolean;
  allowHighRisk?: boolean;
  helperText?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  emptyDescription?: string;
}

export default function CustomServiceTierSelect({
  categories,
  selectedId,
  onSelect,
  label = "Kategori Layanan",
  required = false,
  allowHighRisk = true,
  helperText,
  allowEmpty = false,
  emptyLabel = "Semua Kategori",
  emptyDescription = "Semua kategori aktif",
}: CustomServiceTierSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openUpward, setOpenUpward] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement>(null);

  // Filter allowed categories
  const filteredCategories = React.useMemo(() => {
    if (!allowHighRisk) {
      return categories.filter((c) => !c.is_high_risk && c.tingkat !== "berat");
    }
    return categories;
  }, [categories, allowHighRisk]);

  // Available tiers in this dataset
  const availableTiers = React.useMemo(() => {
    const tiers: TingkatKey[] = [];
    if (filteredCategories.some((c) => (c.tingkat || "ringan") === "ringan")) tiers.push("ringan");
    if (filteredCategories.some((c) => c.tingkat === "sedang")) tiers.push("sedang");
    if (filteredCategories.some((c) => c.tingkat === "berat")) tiers.push("berat");
    return tiers;
  }, [filteredCategories]);

  // Selected item
  const selectedCategory = React.useMemo(
    () => filteredCategories.find((c) => c.id === selectedId),
    [filteredCategories, selectedId]
  );

  const selectedTierKey = (selectedCategory?.tingkat || "ringan") as TingkatKey;
  const selectedTierMeta = TIER_META[selectedTierKey] ?? TIER_META.ringan;

  // Active tab inside dropdown: "semua" or specific tier
  const [activeTab, setActiveTab] = React.useState<TingkatTabKey>(() => {
    if (selectedCategory?.tingkat && availableTiers.includes(selectedCategory.tingkat as TingkatKey)) {
      return selectedCategory.tingkat as TingkatKey;
    }
    return "semua";
  });

  // Calculate placement (dropup vs dropdown) on open
  const toggleDropdown = () => {
    if (!isOpen && triggerButtonRef.current) {
      const rect = triggerButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If space below is less than 340px and space above is larger, flip upward
      if (spaceBelow < 340 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close on click outside (desktop popover mode)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Filtered items based on activeTab and searchQuery
  const itemsInActiveTab = React.useMemo(() => {
    let list = activeTab === "semua"
      ? filteredCategories
      : filteredCategories.filter((c) => (c.tingkat || "ringan") === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((c) => c.nama.toLowerCase().includes(query));
    }
    return list;
  }, [filteredCategories, activeTab, searchQuery]);

  // Render tab buttons
  const renderTabButtons = () => (
    <>
      {/* Tab Semua */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveTab("semua");
        }}
        className={`flex h-9.5 items-center justify-between gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all ${
          activeTab === "semua"
            ? "bg-[#0D47A1] text-white shadow-xs"
            : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
        }`}
      >
        <span className="truncate">Semua</span>
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            activeTab === "semua"
              ? "bg-white/25 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {filteredCategories.length}
        </span>
      </button>

      {/* Tiers Tabs */}
      {availableTiers.map((tierKey) => {
        const meta = TIER_META[tierKey];
        const count = filteredCategories.filter(
          (c) => (c.tingkat || "ringan") === tierKey
        ).length;
        const isTabActive = activeTab === tierKey;

        return (
          <button
            key={tierKey}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(tierKey);
            }}
            className={`flex h-9.5 items-center justify-between gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all ${
              isTabActive
                ? meta.activeTabClass
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`size-2 rounded-full shrink-0 ${
                  isTabActive ? "bg-white" : meta.dotClass
                }`}
              />
              <span className="truncate">{meta.title}</span>
            </div>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                isTabActive
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </>
  );

  // Render search box
  const renderSearchBox = () => (
    <div className="relative shrink-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari layanan, misalnya obat, belanja, atau mengobrol"
        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 py-2 pl-10.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:bg-white focus:outline-none transition-colors"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );

  // Render contextual banner
  const renderContextBanner = () => {
    if (activeTab === "semua") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs text-slate-700">
          <Sparkles className="size-3.5 shrink-0 text-[#0D47A1]" />
          <span>
            Menampilkan seluruh {filteredCategories.length} layanan pendampingan yang tersedia.
          </span>
        </div>
      );
    }
    if (activeTab === "ringan") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs text-emerald-950">
          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong className="font-bold">Tingkat Ringan · Durasi hingga 30 menit:</strong> {TIER_META.ringan.desc}
          </span>
        </div>
      );
    }
    if (activeTab === "sedang") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs text-blue-950">
          <span className="size-2 rounded-full bg-[#0D47A1] shrink-0" />
          <span>
            <strong className="font-bold">Tingkat Sedang · Durasi 31 sampai 60 menit:</strong> {TIER_META.sedang.desc}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs text-amber-950">
        <AlertCircle className="size-3.5 shrink-0 text-amber-600 mt-0.5" />
        <span>
          <strong className="font-bold">Tingkat Berat · Durasi lebih dari 60 menit:</strong> {TIER_META.berat.desc}
        </span>
      </div>
    );
  };

  // Render service items
  const renderServiceItems = () => {
    if (itemsInActiveTab.length === 0) {
      return (
        <div className="py-6 text-center text-xs text-slate-500">
          <p className="font-medium">Tidak ada layanan ditemukan untuk &ldquo;{searchQuery}&rdquo;</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("semua");
            }}
            className="mt-2 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      );
    }

    const renderedItems = itemsInActiveTab.map((cat) => {
      const isSelected = cat.id === selectedId;
      const tierKey = (cat.tingkat || "ringan") as TingkatKey;
      const catMeta = TIER_META[tierKey] ?? TIER_META.ringan;

      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => {
            onSelect(cat.id);
            setIsOpen(false);
          }}
          className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
            isSelected
              ? "border-2 border-[#0D47A1] bg-blue-50/80 shadow-xs ring-1 ring-[#0D47A1]/20"
              : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-bold leading-snug ${
                isSelected ? "text-[#0D47A1]" : "text-slate-900"
              }`}
            >
              {cat.nama}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[9px] font-bold ${catMeta.badgeClass}`}
              >
                {catMeta.title}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="size-3 text-slate-400" />
                {cat.estimasi_durasi_menit ?? 30} menit
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-[#0D47A1]">
                Rp {Number(cat.harga_dasar).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
              isSelected
                ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                : "border-slate-300 bg-white"
            }`}
          >
            {isSelected && <Check className="size-3 stroke-[3]" />}
          </div>
        </button>
      );
    });

    if (allowEmpty && activeTab === "semua" && !searchQuery.trim()) {
      return (
        <>
          <button
            key="all-categories-empty-option"
            type="button"
            onClick={() => {
              onSelect("");
              setIsOpen(false);
            }}
            className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
              !selectedId
                ? "border-2 border-[#0D47A1] bg-blue-50/80 shadow-xs ring-1 ring-[#0D47A1]/20"
                : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-bold leading-snug ${
                  !selectedId ? "text-[#0D47A1]" : "text-slate-900"
                }`}
              >
                {emptyLabel}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {emptyDescription}
              </p>
            </div>
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                !selectedId
                  ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {!selectedId && <Check className="size-3 stroke-[3]" />}
            </div>
          </button>
          {renderedItems}
        </>
      );
    }

    return renderedItems;
  };

  // Render Berat warning notice
  const renderBeratNotice = () => {
    if (activeTab !== "berat") return null;
    return (
      <div className="mt-2 shrink-0 flex items-start gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/90 p-2 text-[11px] text-amber-900">
        <AlertCircle className="size-3.5 shrink-0 text-amber-600 mt-0.5" />
        <span>
          Layanan berat memerlukan konfirmasi dan persetujuan Koordinator wilayah sebelum dijalankan.
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedCategory && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedTierMeta.badgeClass}`}
          >
            <span className={`size-1.5 rounded-full ${selectedTierMeta.dotClass}`} />
            {selectedTierMeta.title} · {selectedTierMeta.durationLabel}
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 leading-relaxed">{helperText}</p>
      )}

      <div className="relative">
        {/* Trigger Button (Closed State: Compact, High Craft, Zero Clutter) */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={toggleDropdown}
          className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 ${
            isOpen
              ? "border-[#0D47A1] ring-2 ring-[#0D47A1]/15"
              : "border-slate-200/90 hover:border-[#0D47A1]/40 hover:bg-slate-50/40"
          }`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          {selectedCategory ? (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2.5 pr-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {selectedCategory.nama}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="size-3 text-slate-400" />
                    {selectedCategory.estimasi_durasi_menit ?? 30} menit
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-bold text-[#0D47A1]">
                    Rp {Number(selectedCategory.harga_dasar).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <span
                className={`shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedTierMeta.badgeClass}`}
              >
                {selectedTierMeta.title}
              </span>
            </div>
          ) : allowEmpty ? (
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="truncate text-sm font-bold text-slate-900">
                  {emptyLabel}
                </p>
                <p className="text-[11px] text-slate-500 font-normal">
                  {emptyDescription}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
              <Sparkles className="size-4 text-slate-300" />
              <span>Pilih kategori layanan...</span>
            </div>
          )}

          <div className="flex shrink-0 items-center pl-2 text-slate-400">
            <ChevronDown
              className={`size-4.5 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#0D47A1]" : ""
              }`}
            />
          </div>
        </button>

        {/* Picker Surface */}
        {isOpen && (
          <>
            {/* ========================================================================= */}
            {/* MOBILE: Bottom Sheet Drawer (Viewport < sm / 640px)                       */}
            {/* ========================================================================= */}
            <div className="sm:hidden">
              {/* Dimmed Backdrop */}
              <div
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0 duration-150"
                onClick={() => setIsOpen(false)}
              />

              {/* Bottom Sheet Container */}
              <div className="fixed inset-x-0 bottom-0 z-50 flex h-[82vh] max-h-[82vh] flex-col overflow-hidden rounded-t-3xl border-t border-slate-200/90 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
                {/* Mobile Drawer Header */}
                <div className="flex shrink-0 items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">Pilih Kategori Layanan</p>
                    <p className="text-xs text-slate-500">Pilih layanan pendampingan sesuai kebutuhan lansia</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Tutup"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Search Box on Mobile */}
                <div className="mb-2 shrink-0">
                  {renderSearchBox()}
                </div>

                {/* Symmetrical 2x2 Segmented Tabs */}
                <div className={`rounded-2xl bg-slate-100/90 p-1.5 shrink-0 ${
                  availableTiers.length === 3 ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"
                }`}>
                  {renderTabButtons()}
                </div>

                {/* Contextual Description Box */}
                <div className="mt-2 shrink-0">
                  {renderContextBanner()}
                </div>

                {/* Inner Scroll List of Services */}
                <div className="mt-2 flex-1 min-h-0 space-y-1.5 overflow-y-auto custom-scrollbar pr-1 pb-2">
                  {renderServiceItems()}
                </div>

                {/* Mobile Drawer Footer Info */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
                  <span>Menampilkan {itemsInActiveTab.length} layanan</span>
                  <span className="text-[11px] text-slate-400">Ketuk kartu untuk memilih</span>
                </div>

                {/* Special Notice for Berat */}
                {renderBeratNotice()}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP: Contained Dropdown Popover (Viewport >= sm / 640px)              */}
            {/* Auto-flip (Dropup/Dropdown) + Max 5 Items Inner Scroll (~275px)           */}
            {/* ========================================================================= */}
            <div
              className={`hidden sm:block absolute left-0 z-40 w-full rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 ${
                openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
              }`}
            >
              {/* Header with Search and Active Filter */}
              <div className="mb-2">
                {renderSearchBox()}
              </div>

              {/* 4-Column Tabs in 1 Clean Horizontal Row */}
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/90 p-1 shrink-0">
                {renderTabButtons()}
              </div>

              {/* Contextual Description Box */}
              <div className="mt-2">
                {renderContextBanner()}
              </div>

              {/* Inner Scroll List: Exactly 5 items visible (~270px) before scrolling */}
              <div className="mt-2 max-h-[275px] space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                {renderServiceItems()}
              </div>

              {/* Desktop Link to Open Modal */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-[#0D47A1] hover:underline"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Buka modal katalog lengkap</span>
                </button>
                <span className="text-[11px] text-slate-400">Maks. 5 item ditampilkan</span>
              </div>

              {/* Special Notice for Berat */}
              {renderBeratNotice()}
            </div>
          </>
        )}
      </div>

      {/* Direct Trigger to Open Modal or Bottom Sheet from Form Surface */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 640) {
              setIsOpen(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D47A1] hover:text-blue-800 hover:underline transition-colors"
        >
          <LayoutGrid className="size-3.5" />
          <span>Lihat semua layanan</span>
        </button>
        <span className="text-[11px] text-slate-400">
          {filteredCategories.length} layanan tersedia
        </span>
      </div>

      {selectedCategory && (
        <section
          aria-label="Ringkasan layanan terpilih"
          className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5"
        >
          <p className="text-sm font-bold text-slate-900">Layanan terpilih</p>
          <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Tingkat layanan</p>
              <p className="mt-0.5 font-semibold text-slate-900">{selectedTierMeta.title}</p>
            </div>
            <div>
              <p className="text-slate-500">Estimasi durasi</p>
              <p className="mt-0.5 font-semibold text-slate-900">
                {selectedCategory.estimasi_durasi_menit ?? 30} menit
              </p>
            </div>
            <div>
              <p className="text-slate-500">Harga dasar</p>
              <p className="mt-0.5 font-semibold text-[#0D47A1]">
                Rp {Number(selectedCategory.harga_dasar).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-blue-100 pt-2.5 text-xs leading-relaxed text-slate-600">
            {selectedTierMeta.desc}
            {selectedCategory.is_high_risk && (
              <span className="font-semibold text-amber-800"> Perlu persetujuan Koordinator sebelum kunjungan dapat dimulai.</span>
            )}
          </p>
        </section>
      )}

      {/* Universal ServiceSelectionModal */}
      <ServiceSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="single"
        categories={categories}
        selectedIds={selectedId ? [selectedId] : []}
        onConfirm={(ids) => {
          if (ids[0]) onSelect(ids[0]);
        }}
        allowHighRisk={allowHighRisk}
        title="Katalog Pilihan Layanan"
        subtitle="Pilih kategori layanan pendampingan lansia yang paling sesuai kebutuhan."
      />
    </div>
  );
}

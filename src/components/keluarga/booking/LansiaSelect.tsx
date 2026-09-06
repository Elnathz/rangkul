"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  Check,
  MapPin,
  User,
  Plus,
  Search,
  X,
} from "lucide-react";

export type LansiaSelectItem = {
  id: string;
  nama: string;
  alamat?: string;
  umur?: number | string;
  hubungan_keluarga?: string;
  foto_url?: string | null;
};

interface LansiaSelectProps {
  lansiaList: LansiaSelectItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  emptyDescription?: string;
}

export default function LansiaSelect({
  lansiaList,
  selectedId,
  onSelect,
  label = "Pilih Lansia",
  required = false,
  helperText,
  error,
  allowEmpty = false,
  emptyLabel = "Semua lokasi",
  emptyDescription = "Cari tanpa membatasi lokasi lansia",
}: LansiaSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openUpward, setOpenUpward] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement>(null);

  const selectedLansia = React.useMemo(
    () => lansiaList.find((l) => l.id === selectedId),
    [lansiaList, selectedId]
  );

  // Filter lansias by search query
  const filteredLansias = React.useMemo(() => {
    if (!searchQuery.trim()) return lansiaList;
    const query = searchQuery.toLowerCase().trim();
    return lansiaList.filter(
      (l) =>
        l.nama.toLowerCase().includes(query) ||
        (l.alamat && l.alamat.toLowerCase().includes(query)) ||
        (l.hubungan_keluarga && l.hubungan_keluarga.toLowerCase().includes(query))
    );
  }, [lansiaList, searchQuery]);

  // Dropdown flip check
  const toggleDropdown = () => {
    if (!isOpen && triggerButtonRef.current) {
      const rect = triggerButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Avatar helper
  const renderAvatar = (name: string) => {
    const initial = name ? name.charAt(0).toUpperCase() : "L";
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#0D47A1] font-black text-sm shadow-2xs">
        {initial}
      </div>
    );
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {lansiaList.length > 0 && (
          <span className="text-[11px] text-slate-400 font-medium">
            {lansiaList.length} profil terdaftar
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 leading-relaxed">{helperText}</p>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={toggleDropdown}
          className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2.5 text-left shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 ${
            error
              ? "border-red-300 ring-2 ring-red-100"
              : isOpen
              ? "border-[#0D47A1] ring-2 ring-[#0D47A1]/15"
              : "border-slate-200/90 hover:border-[#0D47A1]/40 hover:bg-slate-50/40"
          }`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          {selectedLansia ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {renderAvatar(selectedLansia.nama)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {selectedLansia.nama}
                  </p>
                  {selectedLansia.hubungan_keluarga && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 shrink-0">
                      {selectedLansia.hubungan_keluarga}
                    </span>
                  )}
                </div>
                {selectedLansia.alamat ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 truncate">
                    <MapPin className="size-3 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedLansia.alamat}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Alamat domisili belum tertera</p>
                )}
              </div>
            </div>
          ) : allowEmpty ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]">
                <MapPin className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {emptyLabel}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {emptyDescription}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
              <User className="size-4.5 text-slate-300" />
              <span>Pilih anggota lansia...</span>
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

        {/* Dropdown Surface */}
        {isOpen && (
          <>
            {/* Mobile Bottom Sheet Drawer */}
            <div className="sm:hidden">
              <div
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0 duration-150"
                onClick={() => setIsOpen(false)}
              />

              <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-t-3xl border-t border-slate-200/90 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div className="flex shrink-0 items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Pilih Anggota Lansia</p>
                    <p className="text-xs text-slate-500">Pilih lansia yang akan didampingi</p>
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

                {/* Search if > 3 lansias */}
                {lansiaList.length > 3 && (
                  <div className="relative mb-2 shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama atau alamat lansia..."
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 py-2 pl-10.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* List of Lansias */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 py-1">
                  {allowEmpty && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelect("");
                        setIsOpen(false);
                      }}
                      className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all ${
                        !selectedId
                          ? "border-2 border-[#0D47A1] bg-blue-50/70 shadow-xs"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                            !selectedId ? "bg-[#0D47A1] text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <MapPin className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs sm:text-sm font-bold truncate ${
                              !selectedId ? "text-[#0D47A1]" : "text-slate-900"
                            }`}
                          >
                            {emptyLabel}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {emptyDescription}
                          </p>
                        </div>
                      </div>
                      {!selectedId && (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0D47A1] text-white">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  )}

                  {filteredLansias.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      <p>Tidak ada lansia ditemukan</p>
                    </div>
                  ) : (
                    filteredLansias.map((item) => {
                      const isSelected = item.id === selectedId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onSelect(item.id);
                            setIsOpen(false);
                          }}
                          className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-2 border-[#0D47A1] bg-blue-50/70 shadow-xs"
                              : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {renderAvatar(item.nama)}
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs sm:text-sm font-bold truncate ${
                                  isSelected ? "text-[#0D47A1]" : "text-slate-900"
                                }`}
                              >
                                {item.nama}
                              </p>
                              {item.alamat && (
                                <p className="flex items-center gap-1 text-xs text-slate-500 truncate mt-0.5">
                                  <MapPin className="size-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.alamat}</span>
                                </p>
                              )}
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
                    })
                  )}
                </div>

                {/* Add Lansia Option */}
                <div className="pt-2 border-t border-slate-100 shrink-0">
                  <Link
                    href="/lansia/tambah"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-[#0D47A1] bg-blue-50/60 hover:bg-blue-100/60 rounded-xl transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Tambah Profil Lansia Baru</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop Popover (Viewport >= sm) */}
            <div
              className={`hidden sm:block absolute left-0 z-40 w-full rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 ${
                openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
              }`}
            >
              {/* Search input if > 3 lansias */}
              {lansiaList.length > 3 && (
                <div className="relative mb-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau alamat lansia..."
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
              )}

              {/* Inner Scroll List: Exactly 5 items visible (~270px) before scrolling */}
              <div className="max-h-[270px] space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                {allowEmpty && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect("");
                      setIsOpen(false);
                    }}
                    className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
                      !selectedId
                        ? "border-2 border-[#0D47A1] bg-blue-50/70 shadow-xs ring-1 ring-[#0D47A1]/20"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                          !selectedId ? "bg-[#0D47A1] text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <MapPin className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold truncate ${
                            !selectedId ? "text-[#0D47A1]" : "text-slate-900"
                          }`}
                        >
                          {emptyLabel}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {emptyDescription}
                        </p>
                      </div>
                    </div>
                    {!selectedId && (
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0D47A1] text-white">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                )}

                {filteredLansias.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <p>Tidak ada lansia ditemukan untuk &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                ) : (
                  filteredLansias.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelect(item.id);
                          setIsOpen(false);
                        }}
                        className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? "border-2 border-[#0D47A1] bg-blue-50/70 shadow-xs ring-1 ring-[#0D47A1]/20"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderAvatar(item.nama)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-xs font-bold truncate ${
                                  isSelected ? "text-[#0D47A1]" : "text-slate-900"
                                }`}
                              >
                                {item.nama}
                              </p>
                              {item.hubungan_keluarga && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 shrink-0">
                                  {item.hubungan_keluarga}
                                </span>
                              )}
                            </div>
                            {item.alamat && (
                              <p className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                                <MapPin className="size-3 text-slate-400 shrink-0" />
                                <span className="truncate">{item.alamat}</span>
                              </p>
                            )}
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
                  })
                )}
              </div>

              {/* Add Lansia Link */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                <Link
                  href="/lansia/tambah"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
                >
                  <Plus className="size-3.5" />
                  <span>Tambah Profil Lansia Baru</span>
                </Link>
                <span className="text-[11px] text-slate-400">Maks. 5 per scroll</span>
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

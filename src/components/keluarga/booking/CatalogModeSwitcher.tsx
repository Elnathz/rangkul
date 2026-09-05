"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, UserCheck, Users, Zap, Check } from "lucide-react";

export default function CatalogModeSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close when clicked outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-bold shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 ${
          isOpen
            ? "border-[#0D47A1] bg-blue-100/90 text-[#0D47A1] ring-1 ring-[#0D47A1]/20"
            : "border-blue-200/90 bg-blue-50/80 text-[#0D47A1] hover:bg-blue-100/70 hover:border-blue-300"
        }`}
      >
        <UserCheck className="size-4 shrink-0 text-[#0D47A1]" aria-hidden="true" />
        <span className="truncate">Mode: Pilih Langsung</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-[#0D47A1] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-1.5 w-[280px] sm:w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pilihan Mode Penugasan
            </p>
          </div>

          <div className="space-y-1">
            {/* Opsi 1: Pilih Langsung (Aktif) */}
            <button
              type="button"
              role="menuitem"
              aria-current="page"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-blue-200/80 bg-blue-50/80 p-2.5 text-left transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0D47A1] text-white">
                  <UserCheck className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[#0D47A1] truncate">
                      Pilih Langsung
                    </p>
                    <span className="rounded-full bg-[#0D47A1] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Pilih profil dari katalog saat ini
                  </p>
                </div>
              </div>
              <Check className="size-4 shrink-0 text-[#0D47A1] stroke-[2.5]" aria-hidden="true" />
            </button>

            {/* Opsi 2: Beralih ke Pilih dari Pelamar */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                router.push("/booking/new?mode=pelamar");
              }}
              className="group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 group-hover:bg-violet-200 transition-colors">
                  <Users className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-violet-900 truncate">
                      Pilih dari Pelamar
                    </p>
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.2 text-[9px] font-bold text-violet-700">
                      Lowongan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Buka lowongan agar Helper melamar
                  </p>
                </div>
              </div>
            </button>

            {/* Opsi 3: Beralih ke Cari Cepat 15 Menit */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                router.push("/booking/new?mode=cepat");
              }}
              className="group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-amber-200 hover:bg-amber-50/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors">
                  <Zap className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate">
                      Cari Cepat 15 Menit
                    </p>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                      Kilat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Pencocokan otomatis ke Helper aktif
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

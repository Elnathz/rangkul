"use client";

import * as React from "react";
import { Calendar, Users, Zap, ChevronDown, Check } from "lucide-react";

export type BookingMode = "langsung" | "pelamar" | "cepat";

interface ModeOption {
  key: BookingMode;
  title: string;
  desc: string;
  icon: typeof Calendar;
  accentColor: string;
  badgeBg: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    key: "langsung",
    title: "Booking Biasa",
    desc: "Pilih Helper favorit secara langsung",
    icon: Calendar,
    accentColor: "text-[#0D47A1]",
    badgeBg: "bg-blue-50",
  },
  {
    key: "pelamar",
    title: "Pilih dari Pelamar",
    desc: "Buka lowongan untuk pelamar sekitar",
    icon: Users,
    accentColor: "text-violet-700",
    badgeBg: "bg-violet-50",
  },
  {
    key: "cepat",
    title: "Cari Cepat 15 Menit",
    desc: "Sistem cari Helper otomatis terdekat",
    icon: Zap,
    accentColor: "text-amber-700",
    badgeBg: "bg-amber-50",
  },
];

interface CustomModeSelectProps {
  value: BookingMode;
  onChange: (mode: BookingMode) => void;
  availableModes: BookingMode[];
}

export default function CustomModeSelect({
  value,
  onChange,
  availableModes,
}: CustomModeSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption =
    MODE_OPTIONS.find((m) => m.key === value) ?? MODE_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  const filteredOptions = MODE_OPTIONS.filter((opt) =>
    availableModes.includes(opt.key)
  );

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Pilihan Metode Penugasan
      </label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-left shadow-xs transition-all hover:border-slate-300 focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/15"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${activeOption.badgeBg} ${activeOption.accentColor}`}
            >
              <ActiveIcon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {activeOption.title}
              </p>
              <p className="truncate text-xs text-slate-500">
                {activeOption.desc}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center pl-2 text-slate-400">
            <ChevronDown
              className={`size-4.5 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#0D47A1]" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full z-30 mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
            <div role="listbox" className="space-y-1">
              {filteredOptions.map((opt) => {
                const isSelected = opt.key === value;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.key);
                      setIsOpen(false);
                    }}
                    className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-blue-50/70 text-[#0D47A1]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-[#0D47A1] text-white"
                            : `${opt.badgeBg} ${opt.accentColor}`
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold leading-snug ${
                            isSelected ? "text-[#0D47A1]" : "text-slate-900"
                          }`}
                        >
                          {opt.title}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="size-4 shrink-0 text-[#0D47A1] stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateTimePickerProps {
  value: string; // ISO or YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  minDate?: Date;
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const QUICK_TIME_PRESETS = [
  { label: "08:00 Pagi", hour: 8, minute: 0 },
  { label: "10:00 Pagi", hour: 10, minute: 0 },
  { label: "13:00 Siang", hour: 13, minute: 0 },
  { label: "15:30 Sore", hour: 15, minute: 30 },
  { label: "18:00 Malam", hour: 18, minute: 0 },
];

export default function DateTimePicker({
  value,
  onChange,
  label = "Jadwal Kunjungan",
  required = false,
  helperText,
  error,
  minDate = new Date(),
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement>(null);
  const [openUpward, setOpenUpward] = React.useState(false);

  // Parse initial date
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Calendar navigation state
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Selected date parts for temporary staging
  const [tempDate, setTempDate] = React.useState<Date>(() => {
    if (parsedDate) return new Date(parsedDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  });

  const [selectedHour, setSelectedHour] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getHours() : 9;
  });
  const [selectedMinute, setSelectedMinute] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getMinutes() : 0;
  });

  // Outside click & escape handlers
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
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && triggerButtonRef.current) {
      const nextDate = parsedDate ? new Date(parsedDate) : new Date();
      if (!parsedDate) nextDate.setHours(9, 0, 0, 0);

      setViewYear(nextDate.getFullYear());
      setViewMonth(nextDate.getMonth());
      setTempDate(nextDate);
      setSelectedHour(nextDate.getHours());
      setSelectedMinute(nextDate.getMinutes());

      const rect = triggerButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 420 && spaceAbove >= 440) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Quick Day Presets
  const setQuickDay = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    setTempDate(new Date(target));
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  };

  // Calendar days calculation
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 is Mon
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

    // Empty lead days from previous month
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
      });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(viewYear, viewMonth, i),
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Apply selection
  const handleApply = () => {
    const finalDate = new Date(tempDate);
    finalDate.setHours(selectedHour, selectedMinute, 0, 0);

    // Format to YYYY-MM-DDTHH:mm
    const year = finalDate.getFullYear();
    const month = String(finalDate.getMonth() + 1).padStart(2, "0");
    const day = String(finalDate.getDate()).padStart(2, "0");
    const hours = String(finalDate.getHours()).padStart(2, "0");
    const minutes = String(finalDate.getMinutes()).padStart(2, "0");

    const formattedValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    onChange(formattedValue);
    setIsOpen(false);
  };

  // Display text for trigger
  const displayFormattedDate = React.useMemo(() => {
    if (!parsedDate) return null;
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayName = dayNames[parsedDate.getDay()];
    const dateNum = parsedDate.getDate();
    const monthName = MONTH_NAMES_ID[parsedDate.getMonth()];
    const yearNum = parsedDate.getFullYear();
    const hourStr = String(parsedDate.getHours()).padStart(2, "0");
    const minStr = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${dayName}, ${dateNum} ${monthName} ${yearNum} · Pukul ${hourStr}:${minStr} WIB`;
  }, [parsedDate]);

  // Temporary selected date string for preview in picker
  const previewFormattedDate = React.useMemo(() => {
    const dateNum = tempDate.getDate();
    const monthName = MONTH_NAMES_ID[tempDate.getMonth()];
    const yearNum = tempDate.getFullYear();
    const hourStr = String(selectedHour).padStart(2, "0");
    const minStr = String(selectedMinute).padStart(2, "0");
    return `${dateNum} ${monthName} ${yearNum} pukul ${hourStr}:${minStr}`;
  }, [tempDate, selectedHour, selectedMinute]);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();
  const minimumDate = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate()
  );

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {helperText && (
        <p className="text-xs text-slate-500 leading-relaxed">{helperText}</p>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={toggleDropdown}
          className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 ${
            error
              ? "border-red-300 ring-2 ring-red-100"
              : isOpen
              ? "border-[#0D47A1] ring-2 ring-[#0D47A1]/15"
              : "border-slate-200/90 hover:border-[#0D47A1]/40 hover:bg-slate-50/40"
          }`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]">
              <CalendarDays className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              {displayFormattedDate ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {displayFormattedDate}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Jadwal kunjungan pendampingan terekam
                  </p>
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-400">
                  Pilih tanggal & waktu kunjungan...
                </div>
              )}
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

        {/* Popover / Dialog Surface */}
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <div
              className="sm:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0 duration-150"
              onClick={() => setIsOpen(false)}
            />

            {/* Container */}
            <div
              className={`fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:left-0 z-50 sm:w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom sm:fade-in-0 sm:zoom-in-95 duration-150 ${
                openUpward
                  ? "sm:bottom-full sm:mb-2 sm:origin-bottom"
                  : "sm:top-full sm:mt-2 sm:origin-top"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-[#0D47A1]" />
                  <span className="text-sm font-bold text-slate-900">
                    Atur Tanggal & Jam Kunjungan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Tutup pemilih jadwal"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              {/* Quick Day Shortcuts */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2">
                <button
                  type="button"
                  onClick={() => setQuickDay(0)}
                  className={`h-7.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSameDay(tempDate, today)
                      ? "bg-[#0D47A1] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDay(1)}
                  className={`h-7.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSameDay(
                      tempDate,
                      new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    )
                      ? "bg-[#0D47A1] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDay(2)}
                  className={`h-7.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSameDay(
                      tempDate,
                      new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
                    )
                      ? "bg-[#0D47A1] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  Lusa
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDay(3)}
                  className={`h-7.5 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSameDay(
                      tempDate,
                      new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                    )
                      ? "bg-[#0D47A1] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  +3 Hari
                </button>
              </div>

              {/* Month Navigation */}
              <div className="mt-1 flex items-center justify-between px-1 py-1">
                <p className="text-xs font-bold text-slate-800">
                  {MONTH_NAMES_ID[viewMonth]} {viewYear}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    aria-label="Bulan sebelumnya"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    aria-label="Bulan berikutnya"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                {DAY_NAMES_ID.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] font-bold text-slate-400 py-1"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((item, idx) => {
                  const isPast = item.date < minimumDate;
                  const isSelected = isSameDay(item.date, tempDate);
                  const isToday = isSameDay(item.date, today);

                  if (!item.isCurrentMonth) {
                    return (
                      <span
                        key={idx}
                        className="flex h-8.5 items-center justify-center text-xs text-slate-300 pointer-events-none"
                      >
                        {item.day}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast}
                      onClick={() => setTempDate(new Date(item.date))}
                      className={`flex h-8.5 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                        isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#0D47A1] text-white font-bold shadow-xs"
                          : isToday
                          ? "border border-blue-300 text-[#0D47A1] hover:bg-blue-50"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Time Section */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Waktu Kunjungan (WIB)
                  </span>
                  <span className="text-xs font-bold text-[#0D47A1]">
                    {String(selectedHour).padStart(2, "0")}:
                    {String(selectedMinute).padStart(2, "0")} WIB
                  </span>
                </div>

                {/* Quick Time Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {QUICK_TIME_PRESETS.map((preset) => {
                    const isPresetSelected =
                      selectedHour === preset.hour &&
                      selectedMinute === preset.minute;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setSelectedHour(preset.hour);
                          setSelectedMinute(preset.minute);
                        }}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                          isPresetSelected
                            ? "bg-[#0D47A1] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Manual Hour & Minute Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Hours Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Jam (07 - 20)
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                      {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHour(h)}
                          className={`size-7.5 shrink-0 rounded-lg text-xs font-bold transition-all ${
                            selectedHour === h
                              ? "bg-[#0D47A1] text-white"
                              : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {String(h).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minute Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Menit
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                      {[0, 15, 30, 45].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMinute(m)}
                          className={`h-7.5 px-2.5 shrink-0 rounded-lg text-xs font-bold transition-all ${
                            selectedMinute === m
                              ? "bg-[#0D47A1] text-white"
                              : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          :{String(m).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400">Jadwal dipilih:</p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {previewFormattedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-9 px-3 text-xs text-slate-600"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApply}
                    className="h-9 px-4 bg-[#0D47A1] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Check className="size-3.5 mr-1 stroke-[2.5]" />
                    Terapkan Jadwal
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

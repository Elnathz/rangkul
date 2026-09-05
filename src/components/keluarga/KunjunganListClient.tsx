"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  Plus,
  Search,
  X,
  ChevronDown,
  User,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegionAddress } from "@/components/ui/RegionAddress";
import type { TaskStatus } from "@/lib/constants/task-status";

export type KunjunganTaskItem = {
  id: string;
  status: TaskStatus;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  mode_penugasan?: "langsung" | "pelamar" | "cepat" | null;
  alasan_pembatalan?: string | null;
  created_at?: string;
  updated_at?: string;
  lansia_profiles: {
    nama: string;
    alamat: string;
    rt: number | null;
    rw: number | null;
    kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    provinsi: string | null;
    foto_url: string | null;
  } | null;
  service_categories: {
    nama: string;
    estimasi_durasi_menit: number;
  } | null;
  helper_profiles: {
    id?: string;
    foto_wajah_url: string | null;
    users: {
      full_name: string;
    } | null;
  } | null;
  applicant_count?: number;
};

type TabFilter = "semua" | "mendatang" | "selesai" | "dibatalkan";
type SortOption = "terdekat" | "terbaru" | "terlama" | "terbaru_selesai";

const ACTIVE_STATUSES: TaskStatus[] = [
  "diajukan",
  "menunggu_persetujuan_koordinator",
  "dikonfirmasi",
  "dikerjakan",
  "menunggu_persetujuan_keluarga",
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatShortDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function KunjunganListClient({ tasks }: { tasks: KunjunganTaskItem[] }) {
  const [activeTab, setActiveTab] = React.useState<TabFilter>("semua");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOption, setSortOption] = React.useState<SortOption>("terdekat");

  // Tab counts
  const counts = React.useMemo(() => {
    return {
      semua: tasks.length,
      mendatang: tasks.filter((t) => ACTIVE_STATUSES.includes(t.status)).length,
      selesai: tasks.filter((t) => t.status === "selesai").length,
      dibatalkan: tasks.filter((t) => t.status === "dibatalkan").length,
    };
  }, [tasks]);

  // When tab changes, set reasonable default sort
  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    if (tab === "selesai") {
      setSortOption("terbaru_selesai");
    } else if (tab === "dibatalkan" || tab === "semua") {
      setSortOption("terbaru");
    } else {
      setSortOption("terdekat");
    }
  };

  // Filtered tasks by tab and search
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === "mendatang" && !ACTIVE_STATUSES.includes(task.status)) {
        return false;
      }
      if (activeTab === "selesai" && task.status !== "selesai") {
        return false;
      }
      if (activeTab === "dibatalkan" && task.status !== "dibatalkan") {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const catName = task.service_categories?.nama?.toLowerCase() ?? "";
      const lansiaName = task.lansia_profiles?.nama?.toLowerCase() ?? "";
      const helperName = task.helper_profiles?.users?.full_name?.toLowerCase() ?? "";
      const idShort = task.id.toLowerCase();
      const alamat = task.lansia_profiles?.alamat?.toLowerCase() ?? "";

      return (
        catName.includes(q) ||
        lansiaName.includes(q) ||
        helperName.includes(q) ||
        idShort.includes(q) ||
        alamat.includes(q)
      );
    });
  }, [tasks, activeTab, searchQuery]);

  // Sorted tasks
  const sortedTasks = React.useMemo(() => {
    const list = [...filteredTasks];
    const now = new Date().getTime();

    if (sortOption === "terdekat") {
      return list.sort((a, b) => {
        // Priority 1: Sedang Dikerjakan always on top
        if (a.status === "dikerjakan" && b.status !== "dikerjakan") return -1;
        if (b.status === "dikerjakan" && a.status !== "dikerjakan") return 1;

        // Priority 2: Closest upcoming schedule
        const timeA = new Date(a.jadwal_waktu).getTime();
        const timeB = new Date(b.jadwal_waktu).getTime();

        const diffA = timeA - now;
        const diffB = timeB - now;

        // Both in future or both in past
        if (diffA >= 0 && diffB >= 0) return diffA - diffB;
        if (diffA >= 0 && diffB < 0) return -1;
        if (diffA < 0 && diffB >= 0) return 1;
        return diffB - diffA;
      });
    }

    if (sortOption === "terbaru_selesai" || sortOption === "terbaru") {
      return list.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.jadwal_waktu).getTime();
        const dateB = new Date(b.updated_at || b.jadwal_waktu).getTime();
        return dateB - dateA;
      });
    }

    if (sortOption === "terlama") {
      return list.sort((a, b) => {
        const dateA = new Date(a.jadwal_waktu).getTime();
        const dateB = new Date(b.jadwal_waktu).getTime();
        return dateA - dateB;
      });
    }

    return list;
  }, [filteredTasks, sortOption]);

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 pt-24 pb-12 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">
              Perjalanan Pendampingan
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Daftar Kunjungan
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Pantau jadwal, status, dan hasil pendampingan orang tersayang dari satu tempat.
            </p>
          </div>
          <Button
            asChild
            className="h-11 rounded-xl bg-[#0D47A1] font-bold text-white shadow-xs hover:bg-blue-800 shrink-0"
          >
            <Link href="/booking/new" className="flex items-center gap-1.5">
              <Plus className="size-4 stroke-[2.5]" />
              <span>Buat Kunjungan</span>
            </Link>
          </Button>
        </header>

        {/* Interactive Filter Tabs with counts */}
        <nav
          className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar"
          aria-label="Filter status kunjungan"
        >
          <button
            type="button"
            onClick={() => handleTabChange("semua")}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "semua"
                ? "bg-[#0D47A1] text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>Semua</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "semua" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.semua}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("mendatang")}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "mendatang"
                ? "bg-[#0D47A1] text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>Mendatang & Aktif</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "mendatang" ? "bg-white/20 text-white" : "bg-blue-50 text-[#0D47A1]"
              }`}
            >
              {counts.mendatang}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("selesai")}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "selesai"
                ? "bg-emerald-700 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>Selesai</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "selesai" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {counts.selesai}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("dibatalkan")}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "dibatalkan"
                ? "bg-rose-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-700"
            }`}
          >
            <span>Dibatalkan</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "dibatalkan" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {counts.dibatalkan}
            </span>
          </button>
        </nav>

        {/* Controls Row: Search & Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan, lansia, atau helper..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-hidden"
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

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Urutkan:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-11 w-full sm:w-auto min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-bold text-slate-800 shadow-2xs focus:border-[#0D47A1] focus:outline-hidden cursor-pointer"
              >
                <option value="terdekat">Jadwal Terdekat</option>
                <option value="terbaru">Terbaru Dibuat</option>
                <option value="terlama">Terlama Dibuat</option>
                <option value="terbaru_selesai">Terbaru Selesai</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Section Title & Counter */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {activeTab === "semua" && "Seluruh Kunjungan"}
            {activeTab === "mendatang" && "Mendatang & Aktif"}
            {activeTab === "selesai" && "Riwayat Kunjungan Selesai"}
            {activeTab === "dibatalkan" && "Kunjungan Dibatalkan"}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {sortedTasks.length} kunjungan ditemukan
          </span>
        </div>

        {/* Task Cards List */}
        {sortedTasks.length === 0 ? (
          <EmptyKunjunganState
            tab={activeTab}
            searchQuery={searchQuery}
            onReset={() => {
              setSearchQuery("");
              setActiveTab("semua");
            }}
          />
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <KunjunganCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyKunjunganState({
  tab,
  searchQuery,
  onReset,
}: {
  tab: TabFilter;
  searchQuery: string;
  onReset: () => void;
}) {
  if (searchQuery) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <AlertCircle className="mx-auto size-9 text-slate-300" />
        <p className="mt-3 font-bold text-slate-900">
          Tidak ada kunjungan untuk &ldquo;{searchQuery}&rdquo;
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Coba kata kunci lain atau periksa tab filter lainnya.
        </p>
        <Button onClick={onReset} variant="outline" className="mt-4 rounded-xl font-semibold">
          Reset Filter & Pencarian
        </Button>
      </div>
    );
  }

  if (tab === "mendatang") {
    return (
      <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center">
        <Calendar className="mx-auto size-9 text-blue-300" />
        <p className="mt-3 font-bold text-slate-900">Belum ada kunjungan mendatang atau aktif</p>
        <p className="mt-1 text-sm text-slate-500">
          Pesan Helper untuk menjadwalkan pendampingan lansia tersayang Anda.
        </p>
        <Button asChild className="mt-5 rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800">
          <Link href="/booking/new">Buat Kunjungan Baru</Link>
        </Button>
      </div>
    );
  }

  if (tab === "selesai") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <CheckCircle2 className="mx-auto size-9 text-slate-300" />
        <p className="mt-3 font-bold text-slate-900">Belum ada kunjungan yang selesai</p>
        <p className="mt-1 text-sm text-slate-500">
          Kunjungan yang telah selesai dan memiliki laporan akan tercatat di sini.
        </p>
      </div>
    );
  }

  if (tab === "dibatalkan") {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
        <XCircle className="mx-auto size-9 text-rose-400" />
        <p className="mt-3 font-bold text-slate-900">Tidak ada kunjungan yang dibatalkan</p>
        <p className="mt-1 text-sm text-slate-500">
          Semua jadwal pendampingan Anda berjalan dengan lancar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center">
      <FileText className="mx-auto size-9 text-blue-300" />
      <p className="mt-3 font-bold text-slate-900">Belum ada riwayat kunjungan</p>
      <p className="mt-1 text-sm text-slate-500">
        Mulai pendampingan pertama untuk orang tua atau lansia tercinta.
      </p>
      <Button asChild className="mt-5 rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800">
        <Link href="/booking/new">Buat Kunjungan Pertama</Link>
      </Button>
    </div>
  );
}

function KunjunganCard({ task }: { task: KunjunganTaskItem }) {
  const categoryName = task.service_categories?.nama ?? "Layanan Pendampingan";
  const lansiaName = task.lansia_profiles?.nama ?? "Lansia";
  const durationMinutes = task.service_categories?.estimasi_durasi_menit ?? 60;
  const alamat = task.lansia_profiles?.alamat ?? "";
  const priceFormatted = Number(task.harga_final || task.harga_dasar || 0).toLocaleString("id-ID");
  const helper = task.helper_profiles;
  const helperName = helper?.users?.full_name ?? null;
  const helperPhoto = helper?.foto_wajah_url ?? null;
  const shortId = task.id.slice(0, 8).toUpperCase();

  // Varian 1: Sedang Dikerjakan (In-progress highlight)
  if (task.status === "dikerjakan") {
    return (
      <article className="overflow-hidden rounded-2xl border-2 border-[#0D47A1] bg-white shadow-md transition-all hover:shadow-lg">
        {/* Banner Sedang Berlangsung */}
        <div className="flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/40 px-5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0D47A1]">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>Sedang Berlangsung</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">ID #{shortId}</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Level 1: Category, Lansia, Price */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
                {categoryName}
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600">
                Untuk <span className="text-slate-900 font-bold">{lansiaName}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-base sm:text-lg font-black text-[#0D47A1]">Rp {priceFormatted}</p>
            </div>
          </div>

          {/* Level 2: Metadata (Jadwal & Lokasi) */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-start gap-2 min-w-0">
              <Calendar className="size-4 shrink-0 text-[#0D47A1] mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{formatDate(task.jadwal_waktu)}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="size-3 text-slate-400" />
                  {durationMinutes} menit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="size-4 shrink-0 text-[#0D47A1] mt-0.5" />
              <div className="min-w-0">
                <RegionAddress value={alamat} compact />
              </div>
            </div>
          </div>

          {/* Level 3: Helper & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
                {helperPhoto ? (
                  <img src={helperPhoto} alt={helperName || "Helper"} className="size-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-[#0D47A1]">
                    {helperName?.charAt(0) || "H"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{helperName || "Helper Rangkul"}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  Helper Terverifikasi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl font-bold border-slate-200 hover:bg-blue-50 hover:text-[#0D47A1]">
                <Link href={`/beranda/pesan/${task.id}`} className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  <span>Pesan Helper</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="h-9 rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800">
                <Link href={`/kunjungan/${task.id}`}>
                  <span>Lihat Status</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Varian 2: Kunjungan Selesai (Compact card)
  if (task.status === "selesai") {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="size-3" />
                Selesai
              </span>
              <span className="text-[11px] text-slate-400 font-mono">#{shortId}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-tight">
              {categoryName} · <span className="font-medium text-slate-600">{lansiaName}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {formatShortDate(task.jadwal_waktu)} · {helperName || "Helper Rangkul"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-base font-black text-slate-900">Rp {priceFormatted}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
              {helperPhoto ? (
                <img src={helperPhoto} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-slate-700">{helperName?.charAt(0) || "H"}</span>
              )}
            </div>
            <span className="text-xs text-slate-600 truncate font-medium">
              Laporan kunjungan tersedia
            </span>
          </div>

          <Button asChild size="sm" className="h-8 rounded-lg bg-emerald-700 font-bold text-white hover:bg-emerald-800 text-xs">
            <Link href={`/kunjungan/${task.id}`} className="flex items-center gap-1">
              <span>Lihat Laporan</span>
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </article>
    );
  }

  // Varian 3: Kunjungan Dibatalkan (Rose/Red accent card)
  if (task.status === "dibatalkan") {
    return (
      <article className="rounded-2xl border border-rose-200/90 bg-rose-50/20 p-4 sm:p-5 shadow-2xs transition-all hover:border-rose-300 hover:shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                <XCircle className="size-3 text-rose-600" />
                Dibatalkan
              </span>
              <span className="text-[11px] text-slate-400 font-mono">#{shortId}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {categoryName} · <span className="font-medium text-slate-600">{lansiaName}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">{formatShortDate(task.jadwal_waktu)}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-rose-400 line-through">Rp {priceFormatted}</p>
          </div>
        </div>

        {task.alasan_pembatalan && (
          <div className="rounded-xl border border-rose-200/70 bg-rose-50/60 p-3 text-xs text-rose-950">
            <span className="font-bold text-rose-900">Alasan: </span>
            <span>{task.alasan_pembatalan}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300">
            <Link href={`/kunjungan/${task.id}`}>Lihat Detail</Link>
          </Button>
        </div>
      </article>
    );
  }

  // Varian 4: Default Active / Upcoming Card (Diajukan, Menunggu Persetujuan, Dikonfirmasi)
  const statusBadge = getStatusBadge(task.status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm space-y-4">
      {/* Level 1: Category, Lansia, Status, Price */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {statusBadge}
            <span className="text-[11px] font-mono text-slate-400">#{shortId}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
            {categoryName}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600">
            Untuk <span className="font-bold text-slate-900">{lansiaName}</span>
          </p>
        </div>

        <div className="flex sm:flex-col sm:text-right items-center sm:items-end justify-between border-t border-slate-100 sm:border-t-0 pt-2 sm:pt-0 shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-base sm:text-lg font-black text-slate-950">Rp {priceFormatted}</p>
        </div>
      </div>

      {/* Level 2: Metadata (Jadwal & Lokasi) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
        <div className="flex items-start gap-2 min-w-0">
          <Calendar className="size-4 shrink-0 text-[#0D47A1] mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">{formatDate(task.jadwal_waktu)}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="size-3 text-slate-400" />
              {durationMinutes} menit
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <MapPin className="size-4 shrink-0 text-[#0D47A1] mt-0.5" />
          <div className="min-w-0">
            <RegionAddress value={alamat} compact />
          </div>
        </div>
      </div>

      {/* Level 3: Helper Row & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100">
        {/* Helper representation based on assignment status */}
        {helperName ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
              {helperPhoto ? (
                <img src={helperPhoto} alt={helperName} className="size-full object-cover" />
              ) : (
                <span className="text-sm font-black text-[#0D47A1]">
                  {helperName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{helperName}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="size-3" />
                Helper Terverifikasi
              </span>
            </div>
          </div>
        ) : task.mode_penugasan === "pelamar" ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 shrink-0 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Belum ditentukan</p>
              <p className="text-xs text-amber-800 font-medium">
                {task.applicant_count && task.applicant_count > 0
                  ? `${task.applicant_count} Helper telah mengajukan`
                  : "Menunggu Helper mengajukan lamaran"}
              </p>
            </div>
          </div>
        ) : task.mode_penugasan === "cepat" ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 shrink-0 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-[#0D47A1]">
              <Compass className="size-5 animate-spin" style={{ animationDuration: "6s" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Mencari pendamping terdekat...</p>
              <p className="text-xs text-slate-500">Mode Cari Cepat aktif</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 shrink-0 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">Belum ada Helper</p>
              <p className="text-xs text-slate-500">Menunggu konfirmasi tugas</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {helperName && (
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl font-bold border-slate-200 hover:bg-blue-50 hover:text-[#0D47A1]">
              <Link href={`/beranda/pesan/${task.id}`} className="flex items-center gap-1.5">
                <MessageSquare className="size-3.5" />
                <span>Pesan Helper</span>
              </Link>
            </Button>
          )}

          {task.mode_penugasan === "pelamar" && !helperName && (
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl font-bold border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100">
              <Link href={`/kunjungan/${task.id}/pelamar`} className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>Lihat Pelamar</span>
              </Link>
            </Button>
          )}

          <Button asChild size="sm" className="h-9 rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800">
            <Link href={`/kunjungan/${task.id}`} className="flex items-center gap-1">
              <span>Lihat Detail</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case "diajukan":
      return (
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
          Diajukan
        </span>
      );
    case "menunggu_persetujuan_koordinator":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
          <AlertCircle className="size-3 text-amber-600" />
          Menunggu Persetujuan Koordinator
        </span>
      );
    case "dikonfirmasi":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0D47A1]">
          <CheckCircle2 className="size-3 text-[#0D47A1]" />
          Dikonfirmasi
        </span>
      );
    case "menunggu_persetujuan_keluarga":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
          <AlertCircle className="size-3 text-amber-600" />
          Menunggu Persetujuan Keluarga
        </span>
      );
    default:
      return null;
  }
}

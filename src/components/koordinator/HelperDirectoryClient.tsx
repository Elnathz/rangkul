"use client";

import * as React from "react";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegionAddress } from "@/components/ui/RegionAddress";

type ActivityStatus = "sedang_bertugas" | "memiliki_jadwal" | "siap_menerima_tugas" | "tidak_tersedia";
type ActivityFilter = "semua" | ActivityStatus;

type ActiveTask = {
  id: string;
  status: string;
  nama_layanan: string | null;
  jadwal_waktu: string;
  checkin_time: string | null;
};

type VerifiedHelper = {
  id: string;
  nama: string;
  status: string;
  tingkat_kepercayaan: "probation" | "terpercaya";
  is_available: boolean;
  wilayah_domisili: string;
  foto_url: string | null;
  rating_avg: number;
  total_tugas_selesai: number;
  status_aktivitas: ActivityStatus;
  tugas_aktif: ActiveTask | null;
};

type DirectoryResponse = {
  koordinator_wilayah: string;
  total: number;
  helpers: VerifiedHelper[];
};

const filterOptions: Array<{ value: ActivityFilter; label: string }> = [
  { value: "semua", label: "Semua" },
  { value: "sedang_bertugas", label: "Sedang bertugas" },
  { value: "memiliki_jadwal", label: "Ada jadwal" },
  { value: "siap_menerima_tugas", label: "Siap menerima" },
  { value: "tidak_tersedia", label: "Tidak tersedia" },
];

const activityMeta: Record<ActivityStatus, { label: string; className: string; dotClassName: string }> = {
  sedang_bertugas: {
    label: "Sedang bertugas",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    dotClassName: "bg-violet-500",
  },
  memiliki_jadwal: {
    label: "Ada jadwal",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  siap_menerima_tugas: {
    label: "Siap menerima tugas",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  tidak_tersedia: {
    label: "Tidak tersedia",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dotClassName: "bg-slate-400",
  },
};

const taskStatusLabels: Record<string, string> = {
  menunggu_persetujuan_koordinator: "Menunggu approval",
  dikonfirmasi: "Tugas terjadwal",
  dikerjakan: "Sedang dikerjakan",
  menunggu_persetujuan_keluarga: "Menunggu konfirmasi keluarga",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "H";
}

async function fetchDirectoryData() {
  const response = await fetch("/api/koordinator/helpers", { cache: "no-store" });
  const payload = await response.json() as DirectoryResponse & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Directory Helper gagal dimuat.");
  return payload;
}

export default function HelperDirectoryClient() {
  const [directory, setDirectory] = React.useState<DirectoryResponse | null>(null);
  const [filter, setFilter] = React.useState<ActivityFilter>("semua");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [failedAvatarIds, setFailedAvatarIds] = React.useState<Set<string>>(new Set());

  const loadDirectory = React.useCallback(async (isRefresh = false) => {
    setErrorMessage("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const payload = await fetchDirectoryData();
      setDirectory(payload);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Directory Helper gagal dimuat.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void fetchDirectoryData()
      .then((payload) => {
        if (!active) return;
        setDirectory(payload);
        setErrorMessage("");
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "Directory Helper gagal dimuat.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const helpers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (directory?.helpers ?? []).filter((helper) => {
      const matchesFilter = filter === "semua" || helper.status_aktivitas === filter;
      const matchesSearch = !normalizedSearch ||
        helper.nama.toLowerCase().includes(normalizedSearch) ||
        helper.wilayah_domisili.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [directory?.helpers, filter, search]);

  const stats = React.useMemo(() => {
    const allHelpers = directory?.helpers ?? [];
    return {
      total: allHelpers.length,
      active: allHelpers.filter((helper) => helper.status_aktivitas === "sedang_bertugas").length,
      available: allHelpers.filter((helper) => helper.status_aktivitas === "siap_menerima_tugas").length,
      scheduled: allHelpers.filter((helper) => helper.status_aktivitas === "memiliki_jadwal").length,
    };
  }, [directory?.helpers]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />)}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Direktori Helper Terverifikasi
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pantau Helper di wilayahmu</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
              Lihat siapa yang siap menerima tugas dan siapa yang sedang mendampingi lansia saat ini.
            </p>
            {directory?.koordinator_wilayah && (
              <div className="mt-4 max-w-3xl">
                <RegionAddress value={directory.koordinator_wilayah} tone="inverse" compact />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDirectory(true)}
            disabled={refreshing}
            className="w-full rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white md:w-auto"
          >
            <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} aria-hidden="true" />
            {refreshing ? "Memperbarui..." : "Perbarui status"}
          </Button>
        </div>
      </section>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <Activity className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-bold">Data Helper belum tersedia</p>
            <p className="mt-1 leading-relaxed">{errorMessage}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadDirectory()} className="rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-100">
            Coba lagi
          </Button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan aktivitas Helper">
        {[
          { label: "Total terverifikasi", value: stats.total, icon: UsersRound, className: "bg-white text-[#0D47A1]" },
          { label: "Sedang bertugas", value: stats.active, icon: Activity, className: "bg-violet-50 text-violet-700" },
          { label: "Siap menerima", value: stats.available, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
          { label: "Ada jadwal", value: stats.scheduled, icon: Clock3, className: "bg-blue-50 text-blue-700" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.className}`}>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Daftar Helper</h2>
            <p className="mt-1 text-sm text-slate-500">Status diperbarui saat halaman dibuka atau tombol refresh ditekan.</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau wilayah"
              aria-label="Cari Helper berdasarkan nama atau wilayah"
              className="h-11 rounded-xl border-slate-200 pl-10"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter aktivitas Helper">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2 ${
                filter === option.value
                  ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                  : "border-slate-200 bg-white text-blue-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {helpers.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <UsersRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Tidak ada Helper yang cocok</h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
              Coba ubah filter atau kata pencarian. Helper berstatus under review tidak tampil di direktori aktif.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {helpers.map((helper) => {
              const activity = activityMeta[helper.status_aktivitas];
              return (
                <article key={helper.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-base font-bold text-[#0D47A1]">
                      {helper.foto_url && !failedAvatarIds.has(helper.id) ? (
                        <img
                          src={helper.foto_url}
                          alt={`Foto profil ${helper.nama}`}
                          className="h-full w-full object-cover"
                          onError={() => {
                            setFailedAvatarIds((current) => {
                              const next = new Set(current);
                              next.add(helper.id);
                              return next;
                            });
                          }}
                        />
                      ) : getInitials(helper.nama)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="truncate text-base font-bold text-slate-950">{helper.nama}</h3>
                          <div className="mt-2">
                            <RegionAddress value={helper.wilayah_domisili} compact />
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${activity.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${activity.dotClassName}`} aria-hidden="true" />
                          {activity.label}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1 text-amber-600"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> {helper.rating_avg.toFixed(1)}</span>
                        <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" /> {helper.total_tugas_selesai} tugas selesai</span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-700">{helper.tingkat_kepercayaan === "terpercaya" ? "Terpercaya" : "Probation"}</span>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                        {helper.tugas_aktif ? (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-[#0D47A1]">
                              <Activity className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktivitas tugas</p>
                              <p className="mt-1 truncate text-sm font-bold text-slate-900">{helper.tugas_aktif.nama_layanan || "Tugas kunjungan"}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {taskStatusLabels[helper.tugas_aktif.status] || "Tugas aktif"} · {formatDate(helper.tugas_aktif.jadwal_waktu)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            Belum ada tugas aktif saat ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

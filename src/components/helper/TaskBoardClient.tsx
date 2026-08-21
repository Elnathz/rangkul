"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  History,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import type { TaskBoardBucket, TaskBoardStatus } from "@/lib/helper/task-board";

export type BoardTask = {
  id: string;
  status: TaskBoardStatus;
  helper_id: string | null;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  lansia_nama: string;
  lansia_alamat: string;
  lansia_foto_url: string | null;
  catatan_kondisi: string;
  catatan_tugas: string;
  kategori_nama: string;
  kategori_tingkat: string;
  estimasi_durasi_menit: number;
};

const tabOptions: Array<{ value: TaskBoardBucket; label: string; icon: typeof BriefcaseBusiness }> = [
  { value: "tersedia", label: "Tersedia", icon: BriefcaseBusiness },
  { value: "aktif", label: "Aktif", icon: Clock3 },
  { value: "riwayat", label: "Riwayat", icon: History },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "L";
}

export default function TaskBoardClient({
  tasks,
  helperId,
}: {
  tasks: BoardTask[];
  helperId: string;
}) {
  const [activeTab, setActiveTab] = React.useState<TaskBoardBucket>("tersedia");
  const [search, setSearch] = React.useState("");
  const [failedImageIds, setFailedImageIds] = React.useState<Set<string>>(new Set());

  const counts = React.useMemo(() => ({
    tersedia: tasks.filter((task) => task.helper_id === null && task.status === "diajukan").length,
    aktif: tasks.filter((task) => task.helper_id === helperId && task.status !== "selesai" && task.status !== "dibatalkan").length,
    riwayat: tasks.filter((task) => task.helper_id === helperId && ["selesai", "dibatalkan"].includes(task.status)).length,
  }), [helperId, tasks]);

  const filteredTasks = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const isInTab = activeTab === "tersedia"
        ? task.helper_id === null && task.status === "diajukan"
        : activeTab === "aktif"
          ? task.helper_id === helperId && !["selesai", "dibatalkan"].includes(task.status)
          : task.helper_id === helperId && ["selesai", "dibatalkan"].includes(task.status);
      const matchesSearch = !query || [task.lansia_nama, task.kategori_nama, task.lansia_alamat]
        .some((value) => value.toLowerCase().includes(query));
      return isInTab && matchesSearch;
    });
  }, [activeTab, helperId, search, tasks]);

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">
                <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
                Papan Tugas Rangkul
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pilih tugas yang bisa kamu bantu</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Semua tugas di sini berasal dari booking keluarga yang tersimpan di database.
              </p>
            </div>
            <Link href="/helper/tugas/baru">
              <Button className="w-full rounded-xl bg-white text-[#0D47A1] hover:bg-blue-50 md:w-auto">
                Cari tugas berdasarkan radius
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan tugas Helper">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.value} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{tab.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-950">{counts[tab.value]}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Daftar tugas</h2>
              <p className="mt-1 text-sm text-slate-500">Booking direct yang ditujukan kepadamu ada di tab Aktif dengan status menunggu konfirmasi.</p>
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari lansia, layanan, wilayah"
                aria-label="Cari tugas"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter tugas">
            {tabOptions.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2 ${
                  activeTab === tab.value
                    ? "border-[#0D47A1] bg-[#0D47A1] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#0D47A1]"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
                <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{counts[tab.value]}</span>
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Belum ada tugas di tab ini</h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">Data akan muncul setelah ada booking keluarga yang sesuai dengan status dan akses Helper-mu.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {filteredTasks.map((task) => (
                <article key={task.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 font-bold text-[#0D47A1]">
                        {task.lansia_foto_url && !failedImageIds.has(task.id) ? (
                          <img
                            src={task.lansia_foto_url}
                            alt={`Foto ${task.lansia_nama}`}
                            className="h-full w-full object-cover"
                            onError={() => setFailedImageIds((current) => new Set(current).add(task.id))}
                          />
                        ) : getInitials(task.lansia_nama)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-950">{task.lansia_nama}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-slate-400">{task.kategori_nama}</p>
                      </div>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[#0D47A1]"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(task.jadwal_waktu)}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{task.estimasi_durasi_menit} menit</span>
                    </div>
                    <RegionAddress value={task.lansia_alamat} compact />
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
                      <span className="font-bold">Catatan keluarga:</span> {task.catatan_tugas}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Potensi pendapatan</p>
                      <p className="mt-0.5 text-lg font-black text-[#0D47A1]">Rp {(task.harga_final * 0.9).toLocaleString("id-ID")}</p>
                    </div>
                    <Button asChild className="rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800">
                      <Link href={`/tugas/${task.id}`}>
                        Lihat detail
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

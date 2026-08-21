"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ExternalLink, MapPinned, ShieldCheck, UserRound } from "lucide-react";

import { ExtraServiceApprovalCard } from "@/components/keluarga/ExtraServiceApprovalCard";
import { TaskScheduleActions } from "@/components/keluarga/TaskScheduleActions";
import { LansiaPhotoPreview } from "@/components/helper/LansiaPhotoPreview";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import type { TaskStatus } from "@/lib/constants/task-status";

type ExtraServiceStatus = "menunggu_persetujuan_keluarga" | "disetujui" | "ditolak";
type ExtraService = {
  id: string;
  nama_layanan: string;
  biaya: number;
  status: ExtraServiceStatus;
};

export type RealTaskDetail = {
  id: string;
  status: TaskStatus;
  lansia_id: string;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  catatan: string | null;
  lansia: {
    nama: string;
    alamat: string;
    lat: number | null;
    lng: number | null;
    foto_url: string | null;
    catatan_kondisi: string | null;
  };
  category: {
    nama: string;
    deskripsi: string;
    estimasi_durasi_menit: number;
    is_high_risk: boolean;
  };
  helper: {
    id: string;
    foto_url: string | null;
    foto_wajah_url: string | null;
    rating_avg: number;
    total_tugas_selesai: number;
    users: { full_name: string } | { full_name: string }[] | null;
  } | null;
  extraServices: ExtraService[];
  evidence: {
    foto_bukti_url: string;
    catatan_kondisi: string;
    created_at: string;
  } | null;
  healthSnapshot: {
    energi: number;
    mobilitas: number;
    mood: number;
    nafsu_makan: number;
    kualitas_tidur: number;
    cerita_hari_ini: string | null;
    created_at: string;
  } | null;
};

type HelperDetail = NonNullable<RealTaskDetail["helper"]>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function getUserName(users: HelperDetail["users"]) {
  if (!users) return "Helper";
  return Array.isArray(users) ? users[0]?.full_name || "Helper" : users.full_name;
}

function getMapUrl(lansia: RealTaskDetail["lansia"]) {
  if (lansia.lat == null || lansia.lng == null) return null;
  return "https://www.google.com/maps/search/?api=1&query=" + lansia.lat + "," + lansia.lng;
}

function HelperPhoto({ src, name }: { src: string | null; name: string }) {
  const [open, setOpen] = React.useState(false);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "H";

  return (
    <>
      <button
        type="button"
        onClick={() => src && setOpen(true)}
        disabled={!src}
        className="group relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
        aria-label={src ? "Buka foto Helper " + name : "Foto Helper belum tersedia"}
      >
        {src ? <img src={src} alt={"Foto " + name} className="h-full w-full object-cover transition group-hover:scale-105" /> : <span className="flex h-full w-full items-center justify-center text-2xl font-black text-[#0D47A1]">{initials}</span>}
      </button>
      <ImagePreviewModal open={open} onOpenChange={setOpen} src={src} alt={"Foto " + name} title={"Foto Helper " + name} />
    </>
  );
}

export function RealTaskDetailClient({ task }: { task: RealTaskDetail }) {
  const [evidenceOpen, setEvidenceOpen] = React.useState(false);
  const mapUrl = getMapUrl(task.lansia);
  const pendingServices = task.extraServices.filter((service) => service.status === "menunggu_persetujuan_keluarga");
  const decidedServices = task.extraServices.filter((service) => service.status !== "menunggu_persetujuan_keluarga");
  const helperName = task.helper ? getUserName(task.helper.users) : null;


  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/kunjungan" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#0D47A1]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke kunjungan
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Detail kunjungan</p>
            <p className="text-sm font-semibold text-slate-600">ID: {task.id}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-start sm:p-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                {task.category.is_high_risk && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Perlu approval Koordinator</span>}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{task.category.nama}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{task.category.deskripsi}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 sm:min-w-52 sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D47A1]">Total saat ini</p>
              <p className="mt-1 text-2xl font-black text-[#0D47A1]">Rp {Number(task.harga_final).toLocaleString("id-ID")}</p>
            </div>
          </header>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profil lansia</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{task.lansia.nama}</h2>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <LansiaPhotoPreview src={task.lansia.foto_url} name={task.lansia.nama} />
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm"><CalendarDays className="h-5 w-5" aria-hidden="true" /></div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jadwal</p>
                      <p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{formatDate(task.jadwal_waktu)}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0D47A1]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{task.category.estimasi_durasi_menit} menit</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><MapPinned className="h-5 w-5" aria-hidden="true" /></div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lokasi lansia</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{task.lansia.nama}</p>
                      {mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">Buka Maps <ExternalLink className="h-3 w-3" aria-hidden="true" /></a> : <p className="mt-1 text-xs text-slate-500">Koordinat belum tersedia</p>}
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-[#0D47A1]" aria-hidden="true" />
                  <h2 className="text-base font-bold text-slate-950">Alamat lengkap lansia</h2>
                </div>
                <RegionAddress value={task.lansia.alamat} />
              </section>

              <TaskScheduleActions taskId={task.id} status={task.status} jadwalWaktu={task.jadwal_waktu} />

              {pendingServices.map((service) => <ExtraServiceApprovalCard key={service.id} taskId={task.id} service={service} />)}

              {decidedServices.length > 0 && (
                <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Riwayat layanan tambahan</p>
                  <div className="mt-3 space-y-2">
                    {decidedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                        <div>
                          <p className="font-bold text-slate-900">{service.nama_layanan}</p>
                          <p className="text-xs text-slate-500">{service.status === "disetujui" ? "Disetujui" : "Ditolak"}</p>
                        </div>
                        <p className="font-black text-slate-700">Rp {Number(service.biaya).toLocaleString("id-ID")}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {task.evidence && task.healthSnapshot && (
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Laporan kunjungan</p><h2 className="mt-1 text-lg font-black text-slate-950">Catatan dari Helper</h2></div>
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                  </div>
                  <button type="button" className="group mt-4 block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]" onClick={() => setEvidenceOpen(true)} aria-label="Perbesar foto bukti kunjungan">
                    <img src={task.evidence.foto_bukti_url} alt="Bukti kunjungan lansia" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </button>
                  <ImagePreviewModal open={evidenceOpen} onOpenChange={setEvidenceOpen} src={task.evidence.foto_bukti_url} alt="Bukti kunjungan lansia" title="Bukti kunjungan" />
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">{task.evidence.catatan_kondisi}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[['Energi', task.healthSnapshot.energi], ['Mobilitas', task.healthSnapshot.mobilitas], ['Mood', task.healthSnapshot.mood], ['Nafsu makan', task.healthSnapshot.nafsu_makan], ['Tidur', task.healthSnapshot.kualitas_tidur]].map(([label, score]) => <div key={String(label)} className="rounded-xl border border-emerald-100 bg-white p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-lg font-black text-emerald-700">{score}/5</p></div>)}
                  </div>
                  {task.healthSnapshot.cerita_hari_ini && <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Memory Capsule</p><p className="mt-1 text-sm leading-relaxed text-slate-700">{task.healthSnapshot.cerita_hari_ini}</p></div>}
                </section>
              )}

              <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></span>
                  <h2 className="text-lg font-black text-slate-950">Rincian pembayaran</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-slate-600"><span>Harga dasar layanan</span><span className="font-semibold text-slate-900">Rp {Number(task.harga_dasar).toLocaleString("id-ID")}</span></div>
                  {task.harga_final > task.harga_dasar && <div className="flex items-center justify-between gap-4 text-slate-600"><span>Layanan tambahan disetujui</span><span className="font-semibold text-slate-900">Rp {(Number(task.harga_final) - Number(task.harga_dasar)).toLocaleString("id-ID")}</span></div>}
                  <div className="flex items-center justify-between gap-4 border-t border-blue-100 pt-4 text-base font-black text-slate-950"><span>Total saat ini</span><span className="text-xl text-[#0D47A1]">Rp {Number(task.harga_final).toLocaleString("id-ID")}</span></div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">Biaya aplikasi, pajak, dan status pembayaran ditampilkan setelah kontrak pembayaran mengembalikan nominal tersebut.</p>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catatan dari keluarga</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{task.catatan || "Tidak ada catatan tambahan."}</p>
              </section>
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  {helperName ? <HelperPhoto src={task.helper?.foto_wajah_url || task.helper?.foto_url || null} name={helperName} /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-[#0D47A1]"><UserRound className="h-8 w-8" aria-hidden="true" /></div>}
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Helper</p>
                    <h2 className="mt-1 truncate text-lg font-black text-slate-950">{helperName || "Belum ditugaskan"}</h2>
                    {task.helper && <p className="mt-1 text-xs text-slate-500">Rating {Number(task.helper.rating_avg).toFixed(1)} · {task.helper.total_tugas_selesai} tugas selesai</p>}
                  </div>
                </div>
                {helperName && <Link href="/beranda/pesan" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0D47A1] transition hover:border-blue-200 hover:bg-blue-50">Hubungi Helper</Link>}
              </section>
              {task.status === "selesai" && task.evidence && (
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <p className="text-sm font-bold text-slate-900">Laporan kunjungan sudah diterima</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">Kunjungan sudah berstatus selesai. Konfirmasi pembayaran dan pencairan Demo Ledger akan tersedia pada alur pembayaran Sprint 3.</p>
                </section>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

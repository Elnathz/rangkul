"use client";

import { useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ImageOff,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
  ZoomIn,
} from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/lib/constants/task-status";

type Relation<T> = T | T[] | null;

export type ApprovalQueueTask = {
  id: string;
  status: TaskStatus;
  helper_id: string;
  jadwal_waktu: string;
  harga_final: number;
  catatan: string | null;
  lansia_profiles: Relation<{
    nama: string;
    alamat: string;
    catatan_kondisi: string | null;
    foto_url: string | null;
  }>;
  service_categories: Relation<{
    nama: string;
    tingkat: string;
    is_high_risk: boolean;
  }>;
  helper_profiles: Relation<{
    tingkat_kepercayaan: string;
    total_tugas_selesai: number;
    rating_avg: number;
    wilayah_domisili: string;
    bio: string | null;
    foto_wajah_url: string | null;
    verified_by_admin_fallback: boolean;
    users: Relation<{ full_name: string | null }>;
  }>;
};

type ApprovalTaskCardProps = {
  task: ApprovalQueueTask;
  isProcessing: boolean;
  onApprove: (taskId: string) => void;
};

function getRelation<T>(value: Relation<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatTaskDate(value: string) {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "RK";
}

type ProfilePhotoProps = {
  name: string;
  src: string | null;
  accent: "blue" | "emerald";
  title: string;
};

function ProfilePhoto({ name, src, accent, title }: ProfilePhotoProps) {
  const [open, setOpen] = useState(false);
  const accentClass = accent === "blue" ? "bg-blue-100 text-[#0D47A1]" : "bg-emerald-100 text-emerald-700";

  return (
    <>
      <button
        type="button"
        disabled={!src}
        onClick={() => setOpen(true)}
        className={`group relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl border text-left shadow-sm transition ${
          src
            ? "border-slate-200 bg-slate-100 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
            : "cursor-default border-slate-200 bg-slate-50"
        }`}
        aria-label={src ? `Perbesar foto ${title} ${name}` : `Foto ${title} ${name} belum tersedia`}
      >
        {src ? (
          <>
            <img src={src} alt={`Foto ${title} ${name}`} className="h-full w-full object-cover" />
            <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="h-3 w-3" aria-hidden="true" />
              Perbesar
            </span>
          </>
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-[10px] font-semibold text-slate-500">
            <ImageOff className="h-6 w-6 text-slate-400" aria-hidden="true" />
            Foto belum tersedia
          </span>
        )}
      </button>
      <ImagePreviewModal
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={`Foto ${title} ${name}`}
        title={`Foto ${title}: ${name}`}
      />
      <span className={`sr-only ${accentClass}`}>Foto {title}</span>
    </>
  );
}

function ProfilePanel({
  title,
  name,
  src,
  initials,
  accent,
  children,
}: {
  title: string;
  name: string;
  src: string | null;
  initials: string;
  accent: "blue" | "emerald";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5" aria-label={title}>
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent === "blue" ? "bg-blue-100 text-[#0D47A1]" : "bg-emerald-100 text-emerald-700"}`}>
          {accent === "blue" ? <UserRound className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        </span>
        {title}
      </div>
      <div className="flex gap-4">
        <ProfilePhoto name={name} src={src} accent={accent} title={title} />
        <div className="min-w-0 flex-1">
          <div className={`mb-1 flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${accent === "blue" ? "bg-blue-100 text-[#0D47A1]" : "bg-emerald-100 text-emerald-700"}`}>{initials}</div>
          <h3 className="break-words text-base font-black text-slate-950 sm:text-lg">{name}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}

export function ApprovalTaskCard({ task, isProcessing, onApprove }: ApprovalTaskCardProps) {
  const lansia = getRelation(task.lansia_profiles);
  const category = getRelation(task.service_categories);
  const helper = getRelation(task.helper_profiles);
  const user = getRelation(helper?.users || null);

  if (!lansia || !category || !helper) return null;

  const helperName = user?.full_name || "Helper tanpa nama";
  const helperPhoto = helper.foto_wajah_url;
  const helperTrust = helper.tingkat_kepercayaan === "terpercaya" ? "Terpercaya" : "Probation";

  return (
    <article className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_12px_35px_rgba(15,59,112,0.08)] transition hover:border-blue-200 hover:shadow-[0_18px_44px_rgba(15,59,112,0.12)]">
      <header className="border-b border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">Approval diperlukan</span>
              {category.is_high_risk && <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-700 ring-1 ring-red-100">Risiko tinggi</span>}
            </div>
            <h2 className="mt-4 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{category.nama}</h2>
            <p className="mt-1 break-all text-xs font-semibold text-slate-500">ID tugas: {task.id}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Review kecocokan Helper, lansia, jadwal, dan lokasi sebelum tugas diaktifkan.</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 lg:min-w-44 lg:text-right">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 lg:justify-end"><Banknote className="h-3.5 w-3.5" aria-hidden="true" /> Nilai tugas</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">Rp {Number(task.harga_final).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </header>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-4 xl:grid-cols-2">
          <ProfilePanel title="Profil Helper" name={helperName} src={helperPhoto} initials={getInitials(helperName)} accent="blue">
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white px-2.5 py-1 text-[#0D47A1] ring-1 ring-blue-100">{helperTrust}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-amber-700 ring-1 ring-amber-100"><Star className="h-3 w-3 fill-current" aria-hidden="true" /> {Number(helper.rating_avg).toFixed(1)}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">{helper.total_tugas_selesai} tugas selesai</span>
            </div>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">{helper.bio || "Helper belum menambahkan bio."}</p>
            <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-600"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D47A1]" aria-hidden="true" /><span><span className="font-bold text-slate-800">Wilayah domisili:</span> {helper.wilayah_domisili}</span></div>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">{helper.verified_by_admin_fallback ? "Sumber verifikasi: Admin fallback" : "Sumber verifikasi: Koordinator wilayah"}</p>
          </ProfilePanel>

          <ProfilePanel title="Profil lansia" name={lansia.nama} src={lansia.foto_url} initials={getInitials(lansia.nama)} accent="emerald">
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Catatan kondisi</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{lansia.catatan_kondisi || "Belum ada catatan kondisi dari keluarga."}</p>
            <div className="mt-4 border-t border-slate-200 pt-3"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Alamat lengkap</p><RegionAddress value={lansia.alamat} compact /></div>
          </ProfilePanel>
        </div>

        <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4" aria-label="Ringkasan tugas">
          <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" aria-hidden="true" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Jadwal</p><p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{formatTaskDate(task.jadwal_waktu)}</p></div></div>
          <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" aria-hidden="true" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tingkat layanan</p><p className="mt-1 text-sm font-bold capitalize text-slate-900">{category.tingkat}{category.is_high_risk ? " / perlu perhatian" : ""}</p></div></div>
          <div className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" aria-hidden="true" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Referensi tugas</p><p className="mt-1 break-all text-xs font-bold text-slate-900">{task.id}</p></div></div>
          <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" aria-hidden="true" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Lokasi kunjungan</p><div className="mt-1"><RegionAddress value={lansia.alamat} compact /></div></div></div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4" aria-label="Catatan keluarga">
          <p className="text-xs font-black uppercase tracking-wider text-amber-800">Catatan dari keluarga</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{task.catatan || "Tidak ada catatan tambahan dari keluarga."}</p>
        </section>

        <footer className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">Setujui setelah Helper, profil lansia, jadwal, dan wilayah tugas sesuai. Keputusan ini mengaktifkan tugas untuk proses berikutnya.</p>
          <Button type="button" onClick={() => onApprove(task.id)} disabled={isProcessing} className="h-12 w-full rounded-xl bg-[#0D47A1] px-6 font-bold text-white shadow-sm hover:bg-blue-800 sm:w-auto sm:min-w-44">
            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Memproses</> : <><CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" /> Setujui tugas</>}
          </Button>
        </footer>
      </div>
    </article>
  );
}

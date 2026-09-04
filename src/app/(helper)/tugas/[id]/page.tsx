import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPinned, ShieldCheck } from "lucide-react";

import { AcceptTaskButton } from "@/components/helper/AcceptTaskButton";
import { ExtraServiceRequestForm } from "@/components/helper/ExtraServiceRequestForm";
import { LansiaPhotoPreview } from "@/components/helper/LansiaPhotoPreview";
import { StartTaskButton } from "@/components/helper/StartTaskButton";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { canHelperAcceptTask } from "@/lib/helper/task-acceptance";
import { projectHelperTaskPrivacy } from "@/lib/helper/task-privacy";
import type { TaskBoardStatus } from "@/lib/helper/task-board";
import { createAdminClient } from "@/lib/supabase/server";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";

type PageProps = { params: Promise<{ id: string }> };
type Relation<T> = T | T[] | null;
type ExtraServiceStatus = "menunggu_persetujuan_keluarga" | "disetujui" | "ditolak";
type ExtraService = {
  id: string;
  nama_layanan: string;
  biaya: number;
  status: ExtraServiceStatus;
};

type RawTask = {
  id: string;
  status: TaskBoardStatus;
  helper_id: string | null;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  catatan: string | null;
  lansia_profiles: Relation<{
    nama: string;
    alamat: string;
    kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    lat: number | null;
    lng: number | null;
    foto_url: string | null;
    catatan_kondisi: string | null;
  }>;
  service_categories: Relation<{
    nama: string;
    deskripsi: string;
    tingkat: string;
    estimasi_durasi_menit: number;
    is_high_risk: boolean;
  }>;
  task_extra_services: ExtraService[] | null;
};

function getRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
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

export default async function TugasHelperDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: helper } = await supabase
    .from("helper_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!helper) redirect("/helper/verifikasi");

  const taskReader = await createAdminClient();
  const { data: task, error } = await taskReader
    .from("tasks")
    .select(`
      id,
      status,
      helper_id,
      jadwal_waktu,
      harga_dasar,
      harga_final,
      catatan,
      task_extra_services ( id, nama_layanan, biaya, status ),
      lansia_profiles!inner ( nama, alamat, kelurahan, kecamatan, kabupaten_kota, lat, lng, foto_url, catatan_kondisi ),
      service_categories!inner ( nama, deskripsi, tingkat, estimasi_durasi_menit, is_high_risk )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !task) notFound();

  const rawTask = task as unknown as RawTask;
  const lansia = getRelation(rawTask.lansia_profiles);
  const category = getRelation(rawTask.service_categories);
  if (!lansia || !category) notFound();
  const extraServices = rawTask.task_extra_services ?? [];
  const privacy = projectHelperTaskPrivacy({ helper_id: rawTask.helper_id, catatan: rawTask.catatan, lansia }, helper.id);
  const lansiaPhotoUrl = await resolvePrivatePhotoUrl(privacy.lansia_foto_url, async (path, expiresIn) => {
    const { data } = await taskReader.storage.from("dokumen").createSignedUrl(path, expiresIn);
    return data?.signedUrl ?? null;
  });

  const canAccept = canHelperAcceptTask(rawTask.status, rawTask.helper_id, helper.id);
  const canStart = rawTask.status === "dikonfirmasi" && rawTask.helper_id === helper.id;
  const mapUrl = Number.isFinite(Number(privacy.lat)) && Number.isFinite(Number(privacy.lng))
    ? `https://www.google.com/maps/search/?api=1&query=${privacy.lat},${privacy.lng}`
    : null;

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tugas" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#0D47A1]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke papan tugas
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Detail task</p>
            <p className="text-sm font-semibold text-slate-600">ID: {rawTask.id}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-start sm:p-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={rawTask.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">{category.tingkat}</span>
                {category.is_high_risk && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Perlu approval Koordinator</span>}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{category.nama}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{category.deskripsi}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 sm:min-w-48 sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Harga kunjungan</p>
              <p className="mt-1 text-2xl font-black text-[#0D47A1]">Rp {Number(rawTask.harga_final).toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm"><CalendarDays className="h-5 w-5" aria-hidden="true" /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jadwal penugasan</p>
                      <p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{formatTaskDate(rawTask.jadwal_waktu)}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0D47A1]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{category.estimasi_durasi_menit} menit</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><MapPinned className="h-5 w-5" aria-hidden="true" /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lokasi tujuan</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{privacy.lansia_nama}</p>
                      {mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">Buka Maps <ExternalLink className="h-3 w-3" aria-hidden="true" /></a> : <p className="mt-1 text-xs text-slate-500">Koordinat belum tersedia</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profil lansia</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{privacy.lansia_nama}</h2>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <LansiaPhotoPreview src={lansiaPhotoUrl} name={privacy.lansia_nama} />
                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Catatan kondisi</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-950">{privacy.catatan_kondisi || "Detail kondisi tersedia setelah tugas diterima."}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-[#0D47A1]" aria-hidden="true" />
                  <h2 className="text-base font-bold text-slate-950">Alamat lengkap lansia</h2>
                </div>
                <RegionAddress value={privacy.lansia_alamat} />
              </div>

              <ExtraServiceRequestForm taskId={rawTask.id} status={rawTask.status} services={extraServices} />

            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catatan dari keluarga</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{privacy.catatan_tugas || "Detail catatan tersedia setelah tugas diterima."}</p>
              </div>
              {canAccept ? (
                <AcceptTaskButton taskId={rawTask.id} />
              ) : canStart ? (
                <StartTaskButton taskId={rawTask.id} jadwalWaktu={rawTask.jadwal_waktu} />
              ) : rawTask.status === "dikerjakan" ? (
                <div className="space-y-3 rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
                  <p className="text-sm font-bold text-purple-950">Tugas sedang dikerjakan.</p>
                  <Link href={`/tugas/${rawTask.id}/lapor`} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-purple-700 px-4 text-sm font-bold text-white transition hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2">
                    Lanjut ke laporan tugas
                  </Link>
                </div>
              ) : rawTask.status === "menunggu_persetujuan_koordinator" ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-900">
                  Tugas sudah kamu terima dan sedang menunggu persetujuan Koordinator.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-600">
                  Tugas ini belum memiliki aksi lanjutan untuk akunmu.
                </div>
              )}
              <p className="text-center text-xs leading-relaxed text-slate-500">{canStart ? "Tekan mulai saat kamu sudah tiba di lokasi lansia." : "Pastikan jadwal, lokasi, dan catatan keluarga sudah kamu pahami."}</p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

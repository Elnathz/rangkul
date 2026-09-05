import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock, HeartHandshake, Map, MapPin, ShieldAlert } from "lucide-react";

import { AcceptTaskButton } from "@/components/helper/AcceptTaskButton";
import { Button } from "@/components/ui/button";
import { projectHelperTaskPrivacy } from "@/lib/helper/task-privacy";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

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

export default async function DetailPekerjaanPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: helperProfile } = await supabase
    .from("helper_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!helperProfile) redirect("/helper/verifikasi");

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
      lansia_profiles!inner ( nama, alamat, kelurahan, kecamatan, kabupaten_kota, lat, lng, foto_url, catatan_kondisi ),
      service_categories!inner ( nama, deskripsi, estimasi_durasi_menit, tingkat, is_high_risk )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !task) notFound();

  const lansia = Array.isArray(task.lansia_profiles) ? task.lansia_profiles[0] : task.lansia_profiles;
  const category = Array.isArray(task.service_categories) ? task.service_categories[0] : task.service_categories;

  if (!lansia || !category) notFound();

  const privacy = projectHelperTaskPrivacy({ helper_id: task.helper_id, catatan: task.catatan, lansia }, helperProfile.id);

  const isAvailable = task.status === "diajukan" && (
    task.helper_id === null || task.helper_id === helperProfile?.id
  );
  const statusLabel = task.status === "diajukan"
    ? "DIAJUKAN"
    : task.status === "menunggu_persetujuan_koordinator"
      ? "MENUNGGU APPROVAL KOORDINATOR"
      : task.status.toUpperCase().replaceAll("_", " ");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24 font-sans sm:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-gray-100">
        <Link href="/helper/tugas/baru">
          <ArrowLeft className="mr-1 h-5 w-5" />
          Kembali ke daftar tugas
        </Link>
      </Button>

      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-5 border-b border-gray-100 pb-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-sm">
            <HeartHandshake className="h-10 w-10" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-[#0D47A1]">
              STATUS: {statusLabel}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{category.nama}</h1>
            <p className="mt-1 break-all text-sm text-gray-500">ID Tugas: {task.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="border-b border-gray-50 pb-2 font-bold text-gray-900">Jadwal Tugas</h2>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{formatTaskDate(task.jadwal_waktu)}</p>
                <p className="text-sm text-gray-500">Estimasi {category.estimasi_durasi_menit} menit</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{privacy.lansia_nama}</p>
                <p className="text-sm leading-relaxed text-gray-500">{privacy.lansia_alamat}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="border-b border-gray-50 pb-2 font-bold text-gray-900">Rincian Layanan</h2>
            <p className="text-sm leading-relaxed text-gray-600">{category.deskripsi}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                Tingkat {category.tingkat}
              </span>
              {category.is_high_risk && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  Perlu approval Koordinator
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Map className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lokasi tugas</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{privacy.lansia_alamat}</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
          <div className="flex gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-blue-600" aria-hidden="true" />
            <div className="space-y-2 text-sm">
              <p className="font-bold">Catatan dari keluarga</p>
              <p>{privacy.catatan_tugas || "Detail catatan tersedia setelah tugas diterima."}</p>
              <p className="border-t border-blue-200 pt-2">Kondisi lansia: {privacy.catatan_kondisi || "Detail kondisi tersedia setelah tugas diterima."}</p>
            </div>
          </div>
        </div>

        {isAvailable ? (
          <AcceptTaskButton taskId={task.id} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-600">
            Tugas ini sudah tidak tersedia untuk diterima.
          </div>
        )}
      </div>
    </div>
  );
}

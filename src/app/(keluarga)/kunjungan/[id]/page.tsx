import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { RealTaskDetailClient, type RealTaskDetail } from "@/components/keluarga/RealTaskDetailClient";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };
type Relation<T> = T | T[] | null;

type TaskRow = {
  id: string;
  status: RealTaskDetail["status"];
  keluarga_id: string;
  lansia_id: string;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  catatan: string | null;
  lansia_profiles: Relation<RealTaskDetail["lansia"]>;
  service_categories: Relation<RealTaskDetail["category"]>;
  helper_profiles: Relation<RealTaskDetail["helper"]>;
  task_evidence: Relation<RealTaskDetail["evidence"]>;
  health_snapshots: Relation<RealTaskDetail["healthSnapshot"]>;
};

function getRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

export default async function KunjunganDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, status, keluarga_id, lansia_id, jadwal_waktu, harga_dasar, harga_final, catatan, expires_at, mode_penugasan, lansia_profiles!inner ( nama, alamat, lat, lng, foto_url, catatan_kondisi ), service_categories!inner ( nama, deskripsi, estimasi_durasi_menit, is_high_risk ), helper_profiles ( id, user_id, foto_wajah_url, rating_avg, total_tugas_selesai, users!inner ( full_name ) ), task_evidence ( foto_bukti_url, catatan_kondisi, created_at ), health_snapshots ( energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini, created_at )")
    .eq("id", id)
    .eq("keluarga_id", user.id)
    .maybeSingle();

  if (taskError || !task) notFound();

  const { data: extraServices, error: extraServiceError } = await supabase
    .from("task_extra_services")
    .select("id, nama_layanan, biaya, status, created_at")
    .eq("task_id", id)
    .order("created_at", { ascending: false });

  if (extraServiceError) notFound();

  const row = task as unknown as TaskRow;
  const lansia = getRelation(row.lansia_profiles);
  const category = getRelation(row.service_categories);
  const helper = getRelation(row.helper_profiles);

  if (!lansia || !category) notFound();

  return (
    <RealTaskDetailClient
      task={{
        id: row.id,
        status: row.status,
        lansia_id: row.lansia_id,
        jadwal_waktu: row.jadwal_waktu,
        harga_dasar: Number(row.harga_dasar),
        harga_final: Number(row.harga_final),
        catatan: row.catatan,
        lansia,
        category,
        helper,
        evidence: getRelation(row.task_evidence),
        healthSnapshot: getRelation(row.health_snapshots),
        extraServices: (extraServices ?? []).map((service) => ({
          id: service.id,
          nama_layanan: service.nama_layanan,
          biaya: Number(service.biaya),
          status: service.status,
        })),
      }}
    />
  );
}

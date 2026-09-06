import { redirect } from "next/navigation";

import TaskBoardClient, { type BoardTask } from "@/components/helper/TaskBoardClient";
import { projectHelperTaskPrivacy } from "@/lib/helper/task-privacy";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { TaskBoardStatus } from "@/lib/helper/task-board";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";

type Relation<T> = T | T[] | null;

type RawTask = {
  id: string;
  status: TaskBoardStatus;
  helper_id: string | null;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  expires_at: string | null;
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
    tingkat: string;
    estimasi_durasi_menit: number;
  }>;
};

function getRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

export default async function TugasHelperPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("helper_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/beranda");
  }

  const taskReader = await createAdminClient();
  const { data: taskRows } = await taskReader
    .from("tasks")
    .select(`
      id,
      status,
      helper_id,
      jadwal_waktu,
      harga_dasar,
      harga_final,
      expires_at,
      catatan,
      lansia_profiles ( nama, alamat, kelurahan, kecamatan, kabupaten_kota, lat, lng, foto_url, catatan_kondisi ),
      service_categories ( nama, tingkat, estimasi_durasi_menit )
    `)
    .or(`helper_id.is.null,helper_id.eq.${profile.id}`)
    .order("jadwal_waktu", { ascending: true });

  // Server render needs one consistent timestamp for the expiry check.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const visibleRows = (taskRows as unknown as RawTask[] || [])
    .filter((task) => {
      const isMarketplaceTask = task.helper_id === null && task.status === "diajukan";
      const isOwnTask = task.helper_id === profile.id;
      const isExpiredMarketplaceTask = isMarketplaceTask && task.expires_at !== null && new Date(task.expires_at).getTime() <= now;
      return (isMarketplaceTask || isOwnTask) && !isExpiredMarketplaceTask;
    });
  const tasks = (await Promise.all(visibleRows.map(async (task) => {
      const lansia = getRelation(task.lansia_profiles);
      const category = getRelation(task.service_categories);
      if (!lansia || !category) return null;
      const privacy = projectHelperTaskPrivacy({ helper_id: task.helper_id, catatan: task.catatan, lansia }, profile.id);
      const photoUrl = await resolvePrivatePhotoUrl(privacy.lansia_foto_url, async (path, expiresIn) => {
        const { data } = await taskReader.storage.from("dokumen").createSignedUrl(path, expiresIn);
        return data?.signedUrl ?? null;
      });
      return {
        id: task.id,
        status: task.status,
        helper_id: task.helper_id,
        jadwal_waktu: task.jadwal_waktu,
        harga_dasar: Number(task.harga_dasar),
        harga_final: Number(task.harga_final),
        lansia_nama: privacy.lansia_nama,
        lansia_alamat: privacy.lansia_alamat,
        lansia_foto_url: photoUrl,
        catatan_kondisi: privacy.catatan_kondisi || "Detail kondisi tersedia setelah tugas diterima.",
        catatan_tugas: privacy.catatan_tugas || "Detail catatan tersedia setelah tugas diterima.",
        kategori_nama: category.nama,
        kategori_tingkat: category.tingkat,
        estimasi_durasi_menit: category.estimasi_durasi_menit,
      } satisfies BoardTask;
    })))
    .filter((task): task is BoardTask => task !== null);

  return <TaskBoardClient tasks={tasks} helperId={profile.id} />;
}

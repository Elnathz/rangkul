import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/constants/task-status";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";
import KunjunganListClient, { type KunjunganTaskItem } from "@/components/keluarga/KunjunganListClient";

type Relation<T> = T | T[] | null;

type RawTaskRow = {
  id: string;
  status: TaskStatus;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  mode_penugasan?: "langsung" | "pelamar" | "cepat" | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  lansia_profiles: Relation<{
    nama: string;
    alamat: string;
    rt: number | null;
    rw: number | null;
    kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    provinsi: string | null;
    foto_url: string | null;
  }>;
  service_categories: Relation<{
    nama: string;
    estimasi_durasi_menit: number;
  }>;
  helper_profiles: Relation<{
    id?: string;
    foto_wajah_url: string | null;
    users: Relation<{ full_name: string }>;
  }>;
  task_applications?: Array<{ id: string; status: string }> | null;
};

function relation<T>(value: Relation<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function KunjunganPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const taskReader = await createAdminClient();
  const { data, error } = await taskReader
    .from("tasks")
    .select(`
      id,
      status,
      jadwal_waktu,
      harga_dasar,
      harga_final,
      mode_penugasan,
      cancellation_reason,
      created_at,
      updated_at,
      lansia_profiles!inner ( nama, alamat, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, foto_url ),
      service_categories!inner ( nama, estimasi_durasi_menit ),
      helper_profiles ( id, foto_wajah_url, users ( full_name ) ),
      task_applications ( id, status )
    `)
    .eq("keluarga_id", user.id)
    .order("jadwal_waktu", { ascending: false });

  const rawTasks = (error ? [] : (data ?? [])) as unknown as RawTaskRow[];

  const tasks: KunjunganTaskItem[] = await Promise.all(
    rawTasks.map(async (task) => {
      const helper = relation(task.helper_profiles);
      let signedHelper = null;

      if (helper) {
        const photoUrl = await resolvePrivatePhotoUrl(
          helper.foto_wajah_url,
          async (path, expiresIn) => {
            const { data: signed } = await taskReader.storage
              .from("dokumen")
              .createSignedUrl(path, expiresIn);
            return signed?.signedUrl ?? null;
          }
        );

        signedHelper = {
          id: helper.id,
          foto_wajah_url: photoUrl,
          users: relation(helper.users),
        };
      }

      const applicantCount = Array.isArray(task.task_applications)
        ? task.task_applications.filter((a) => a.status === "pending").length
        : 0;

      return {
        id: task.id,
        status: task.status,
        jadwal_waktu: task.jadwal_waktu,
        harga_dasar: task.harga_dasar,
        harga_final: task.harga_final,
        mode_penugasan: task.mode_penugasan ?? null,
        alasan_pembatalan: task.cancellation_reason ?? null,
        created_at: task.created_at,
        updated_at: task.updated_at,
        lansia_profiles: relation(task.lansia_profiles),
        service_categories: relation(task.service_categories),
        helper_profiles: signedHelper,
        applicant_count: applicantCount,
      };
    })
  );

  return <KunjunganListClient tasks={tasks} />;
}

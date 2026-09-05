import { notFound, redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";
import TaskApplicantsClient, {
  type ApplicantItem,
} from "@/components/keluarga/TaskApplicantsClient";
import { distanceInKm } from "@/lib/geo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

export default async function TaskApplicantsPage({ params }: PageProps) {
  const { id: taskId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!isSprint6MatchingEnabled()) {
    notFound();
  }

  const adminClient = await createAdminClient();

  // 1. Ambil detail tugas dan pastikan pemiliknya adalah user keluarga ini
  const { data: task, error: taskError } = await adminClient
    .from("tasks")
    .select(`
      id,
      status,
      keluarga_id,
      jadwal_waktu,
      harga_final,
      mode_penugasan,
      lansia_profiles!inner ( nama, lat, lng ),
      service_categories!inner ( nama )
    `)
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !task || task.keluarga_id !== user.id) {
    notFound();
  }

  // 2. Ambil pelamar yang mengajukan diri
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawApps, error: appsError } = await (adminClient as any)
    .from("task_applications")
    .select(`
      id,
      status,
      diajukan_at,
      helper_profiles!inner (
        id,
        user_id,
        foto_wajah_url,
        rating_avg,
        total_tugas_selesai,
        tingkat_kepercayaan,
        domisili_lat,
        domisili_lng,
        users!inner ( full_name )
      )
    `)
    .eq("task_id", taskId)
    .order("diajukan_at", { ascending: true });

  if (appsError) {
    console.error("Error fetching applicants on page:", appsError);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lansia = (task.lansia_profiles as any) as { nama: string; lat: number | null; lng: number | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = (task.service_categories as any) as { nama: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicants: ApplicantItem[] = (rawApps || []).map((app: any) => {
    const helper = app.helper_profiles;
    let jarakKm = 0;
    if (
      lansia?.lat != null &&
      lansia?.lng != null &&
      helper?.domisili_lat != null &&
      helper?.domisili_lng != null
    ) {
      jarakKm =
        Math.round(
          distanceInKm(
            Number(helper.domisili_lat),
            Number(helper.domisili_lng),
            Number(lansia.lat),
            Number(lansia.lng)
          ) * 10
        ) / 10;
    }

    return {
      application_id: app.id,
      status: app.status,
      diajukan_at: app.diajukan_at,
      helper: {
        id: helper.id,
        full_name: helper.users?.full_name || "Helper Rangkul",
        foto_wajah_url: helper.foto_wajah_url || null,
        rating_avg: Number(helper.rating_avg) || 5.0,
        total_tugas_selesai: Number(helper.total_tugas_selesai) || 0,
        tingkat_kepercayaan: helper.tingkat_kepercayaan || "terpercaya",
        jarak_km: jarakKm,
      },
    };
  });

  return (
    <TaskApplicantsClient
      taskId={task.id}
      taskTitle={category?.nama || "Tugas Pendampingan"}
      taskStatus={task.status}
      lansiaName={lansia?.nama || "Lansia"}
      jadwalWaktu={task.jadwal_waktu}
      hargaFinal={Number(task.harga_final)}
      initialApplicants={applicants}
    />
  );
}

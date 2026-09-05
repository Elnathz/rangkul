import { apiResponse, createApiError } from "@/lib/api-response";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ApprovalQueueTask } from "@/components/koordinator/ApprovalTaskCard";

function relation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login", 401);

    const { data: actor } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    if (actor?.role !== "koordinator") {
      return createApiError("forbidden", "Hanya Koordinator yang dapat melihat antrean", 403);
    }

    const { data: profile, error: profileError } = await supabase
      .from("koordinator_profiles")
      .select("id, wilayah, status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError || !profile) return createApiError("not_found", "Profil Koordinator tidak ditemukan", 404);
    if (profile.status !== "verified") return apiResponse({ data: { koordinator: profile, tasks: [] } }, 200);

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        status,
        helper_id,
        jadwal_waktu,
        harga_final,
        catatan,
        lansia_profiles!inner ( nama, alamat, catatan_kondisi, foto_url ),
        service_categories!inner ( nama, tingkat, is_high_risk ),
        helper_profiles!inner ( tingkat_kepercayaan, total_tugas_selesai, suspend_reason, rating_avg, wilayah_domisili, bio, foto_wajah_url, verified_by_admin_fallback, users!inner ( full_name ) )
      `)
      .eq("status", "menunggu_persetujuan_koordinator")
      .order("jadwal_waktu", { ascending: true });
    if (error) return createApiError("server_error", "Antrean tugas belum dapat dimuat", 500);

    const fileReader = await createAdminClient();
    const tasks = await Promise.all(((data ?? []) as unknown as ApprovalQueueTask[]).map(async (task) => {
      const lansia = relation(task.lansia_profiles);
      const helper = relation(task.helper_profiles);
      const sign = (value: string | null | undefined) => resolvePrivatePhotoUrl(value, async (path, expiresIn) => {
        const { data: signed } = await fileReader.storage.from("dokumen").createSignedUrl(path, expiresIn);
        return signed?.signedUrl ?? null;
      });
      const [lansiaPhoto, helperPhoto] = await Promise.all([
        sign(lansia?.foto_url),
        sign(helper?.foto_wajah_url),
      ]);
      return {
        ...task,
        lansia_profiles: lansia
          ? (Array.isArray(task.lansia_profiles) ? [{ ...lansia, foto_url: lansiaPhoto }] : { ...lansia, foto_url: lansiaPhoto })
          : null,
        helper_profiles: helper
          ? (Array.isArray(task.helper_profiles) ? [{ ...helper, foto_wajah_url: helperPhoto }] : { ...helper, foto_wajah_url: helperPhoto })
          : null,
      } satisfies ApprovalQueueTask;
    }));

    return apiResponse({ data: { koordinator: profile, tasks } }, 200);
  } catch {
    return createApiError("server_error", "Antrean tugas belum dapat dimuat", 500);
  }
}

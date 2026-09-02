import { apiResponse, createApiError } from "@/lib/api-response";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk melihat tugas", 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return createApiError("forbidden", "Profil pengguna tidak dapat diverifikasi", 403);
    }

    let query = supabase
      .from("tasks")
      .select(`
        id, status, helper_id, jadwal_waktu, harga_dasar, harga_final, catatan,
        lansia_profiles!inner ( nama, foto_url, catatan_kondisi ),
        service_categories!inner ( nama, deskripsi, estimasi_durasi_menit )
      `)
      .eq("id", taskId);

    if (profile.role === "helper") {
      const { data: helper } = await supabase.from("helper_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (!helper) return createApiError("not_found", "Profil Helper tidak ditemukan", 404);
      query = query.eq("helper_id", helper.id);
    } else if (profile.role === "keluarga") {
      query = query.eq("keluarga_id", user.id);
    } else {
      return createApiError("forbidden", "Akun ini tidak dapat melihat detail tugas", 403);
    }

    const { data: task, error: taskError } = await query.maybeSingle();
    if (taskError) return createApiError("server_error", taskError.message, 500);
    if (!task) return createApiError("not_found", "Tugas tidak ditemukan", 404);

    const admin = await createAdminClient();
    const lansiaProfiles = Array.isArray(task.lansia_profiles) ? task.lansia_profiles[0] : task.lansia_profiles;
    const signedLansiaFoto = await resolvePrivatePhotoUrl(lansiaProfiles?.foto_url ?? null, async (path, exp) => {
      const { data, error } = await admin.storage.from("dokumen").createSignedUrl(path, exp);
      return error ? null : data.signedUrl;
    });

    const transformedTask = {
      ...task,
      lansia_profiles: lansiaProfiles
        ? { ...lansiaProfiles, foto_url: signedLansiaFoto }
        : lansiaProfiles,
    };

    return apiResponse({ task: transformedTask });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Detail tugas belum dapat dimuat",
      500,
    );
  }
}

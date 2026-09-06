import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";
import { distanceInKm } from "@/lib/geo";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengajukan diri", 401);
    }

    if (!isSprint6MatchingEnabled()) {
      return createApiError("not_found", "Fitur belum tersedia", 404);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat mengajukan diri untuk tugas", 403);
    }

    // Call atomic RPC apply_to_task
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error: rpcError } = await (supabase as any).rpc("apply_to_task", {
      p_task_id: taskId,
    });

    if (rpcError) {
      console.error("apply_to_task RPC error:", rpcError);
      return createApiError("server_error", rpcError.message, 500);
    }

    const res = (result || {}) as { success: boolean; code?: string; message: string; application_id?: string };
    if (!res.success) {
      const code = res.code || "forbidden";
      let status = 403;
      if (code === "task_not_found") status = 404;
      else if (code === "duplicate_application" || code === "task_not_available" || code === "task_expired" || code === "schedule_conflict") status = 409;
      return createApiError(code, res.message, status);
    }

    return apiResponse({
      message: res.message,
      application_id: res.application_id,
    }, 201);
  } catch (error: unknown) {
    console.error("Apply to task API error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

export async function GET(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    if (!isSprint6MatchingEnabled()) {
      return createApiError("not_found", "Fitur belum tersedia", 404);
    }

    // Verifikasi task milik Keluarga pemanggil
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, keluarga_id, lansia_id, lansia_profiles(lat, lng)")
      .eq("id", taskId)
      .maybeSingle();

    if (taskError || !task) {
      return createApiError("not_found", "Tugas tidak ditemukan", 404);
    }

    if (task.keluarga_id !== user.id) {
      return createApiError("forbidden", "Anda bukan pemilik tugas ini", 403);
    }

    const adminSupabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: applications, error: appError } = await (adminSupabase as any)
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

    if (appError) {
      console.error("Error fetching task applications:", appError);
      return createApiError("server_error", "Gagal memuat daftar pelamar", 500);
    }

    const lansiaLoc = (task.lansia_profiles as unknown) as { lat?: number | null; lng?: number | null } | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (applications || []).map((app: any) => {
      const helper = app.helper_profiles;
      let jarakKm = 0;
      if (lansiaLoc?.lat != null && lansiaLoc?.lng != null && helper?.domisili_lat != null && helper?.domisili_lng != null) {
        jarakKm = Math.round(distanceInKm(Number(helper.domisili_lat), Number(helper.domisili_lng), Number(lansiaLoc.lat), Number(lansiaLoc.lng)) * 10) / 10;
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

    return apiResponse({ data }, 200);
  } catch (error: unknown) {
    console.error("List task applications API error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

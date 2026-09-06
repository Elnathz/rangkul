import { createAdminClient, createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };
type TaskRelation = {
  id: string;
  status: string;
  helper_id: string | null;
  expires_at: string | null;
  helper_profiles: { id: string; koordinator_id: string | null; verified_by_admin_fallback?: boolean } | { id: string; koordinator_id: string | null; verified_by_admin_fallback?: boolean }[] | null;
  lansia_profiles: { kelurahan: string | null; kecamatan: string | null; rw: number | null; rt: number | null } | { kelurahan: string | null; kecamatan: string | null; rw: number | null; rt: number | null }[] | null;
};

function getRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk menyetujui tugas", 401);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role, kelurahan, kecamatan, rw, rt")
      .eq("id", user.id)
      .single();

    if (userError || (userProfile?.role !== "koordinator" && userProfile?.role !== "admin")) {
      return createApiError("forbidden", "Hanya Koordinator atau Admin yang dapat menyetujui tugas", 403);
    }

    let koordinatorProfileId: string | null = null;
    if (userProfile.role === "koordinator") {
      const { data: koordinator, error: koordinatorError } = await supabase
        .from("koordinator_profiles")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (koordinatorError || !koordinator) {
        return createApiError("not_found", "Profil Koordinator tidak ditemukan", 404);
      }

      if (koordinator.status !== "verified") {
        return createApiError("forbidden", "Akun Koordinator belum diverifikasi", 403);
      }

      koordinatorProfileId = koordinator.id;
    }

    const taskWriter = await createAdminClient();
    const { data: taskRow, error: taskError } = await taskWriter
      .from("tasks")
      .select(`
        id, status, helper_id, expires_at,
        helper_profiles ( id, koordinator_id, verified_by_admin_fallback ),
        lansia_profiles ( kelurahan, kecamatan, rw, rt )
      `)
      .eq("id", id)
      .maybeSingle();

    if (taskError) {
      return createApiError("server_error", taskError.message, 500);
    }

    if (!taskRow) {
      return createApiError("not_found", "Tugas tidak ditemukan atau bukan dalam wilayah Anda", 404);
    }

    const task = taskRow as unknown as TaskRelation;
    const helper = getRelation(task.helper_profiles);
    const lansia = getRelation(task.lansia_profiles);

    if (!task.expires_at || new Date(task.expires_at).getTime() <= Date.now()) {
      return createApiError("conflict", "Batas waktu persetujuan Koordinator sudah lewat", 409);
    }

    if (
      task.status !== "menunggu_persetujuan_koordinator" ||
      !task.helper_id
    ) {
      return createApiError("conflict", "Tugas sudah berubah atau tidak membutuhkan persetujuan Anda", 409);
    }

    if (userProfile.role !== "admin") {
      // 1. Koordinator asal Helper
      const isHelperKoordinator = helper?.koordinator_id === koordinatorProfileId;

      // 2. Koordinator wilayah tugas/lansia (jika helper fallback admin / tanpa koordinator terpasang)
      const isFallbackHelper = !helper?.koordinator_id || helper?.verified_by_admin_fallback === true;
      const isTaskRegionKoordinator = isFallbackHelper && Boolean(
        (lansia?.kelurahan && userProfile.kelurahan && lansia.kelurahan.toLowerCase().trim() === userProfile.kelurahan.toLowerCase().trim()) ||
        (lansia?.kecamatan && userProfile.kecamatan && lansia.kecamatan.toLowerCase().trim() === userProfile.kecamatan.toLowerCase().trim())
      );

      if (!isHelperKoordinator && !isTaskRegionKoordinator) {
        return createApiError("conflict", "Tugas sudah berubah atau tidak membutuhkan persetujuan Anda", 409);
      }
    }

    const { data: approvedTask, error: approveError } = await taskWriter
      .from("tasks")
      .update({ status: "dikonfirmasi" })
      .eq("id", id)
      .eq("helper_id", task.helper_id)
      .eq("status", "menunggu_persetujuan_koordinator")
      .select("id, status, helper_id")
      .maybeSingle();

    if (approveError) {
      return createApiError("server_error", approveError.message, 500);
    }

    if (!approvedTask) {
      return createApiError("conflict", "Tugas sudah diproses oleh pengguna lain", 409);
    }

    return apiResponse({
      message: userProfile.role === "admin"
        ? "Tugas disetujui oleh Admin Platform dan Helper dapat melanjutkan ke jadwal tugas"
        : "Tugas disetujui dan Helper dapat melanjutkan ke jadwal tugas",
      task: approvedTask,
    });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Tugas belum dapat disetujui",
      500,
    );
  }
}

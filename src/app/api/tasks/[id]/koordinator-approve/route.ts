import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };
type TaskRelation = {
  id: string;
  status: string;
  helper_id: string | null;
  helper_profiles: { koordinator_id: string | null } | { koordinator_id: string | null }[] | null;
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
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "koordinator") {
      return createApiError("forbidden", "Hanya Koordinator yang dapat menyetujui tugas", 403);
    }

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

    const { data: taskRow, error: taskError } = await supabase
      .from("tasks")
      .select("id, status, helper_id, helper_profiles!inner ( koordinator_id )")
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

    if (
      task.status !== "menunggu_persetujuan_koordinator" ||
      !task.helper_id ||
      helper?.koordinator_id !== koordinator.id
    ) {
      return createApiError("conflict", "Tugas sudah berubah atau tidak membutuhkan persetujuan Anda", 409);
    }

    const { data: approvedTask, error: approveError } = await supabase
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
      message: "Tugas disetujui dan Helper dapat melanjutkan ke jadwal tugas",
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

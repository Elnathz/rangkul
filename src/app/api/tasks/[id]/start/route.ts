import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import { startTaskSchema } from "@/lib/validations/task";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk memulai tugas", 401);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat memulai tugas", 403);
    }

    const { data: helper, error: helperError } = await supabase
      .from("helper_profiles")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (helperError || !helper) {
      return createApiError("not_found", "Profil Helper tidak ditemukan", 404);
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const validation = startTaskSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: "validation_error",
        message: "Data check-in tidak valid",
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 400);
    }

    if (helper.status !== "verified") {
      return createApiError("forbidden", "Profil Helper belum diverifikasi atau sedang ditinjau", 403);
    }

    const { data: startedTask, error: startError } = await supabase
      .from("tasks")
      .update({
        status: "dikerjakan",
        checkin_time: new Date().toISOString(),
        checkin_lat: validation.data.checkin_lat ?? null,
        checkin_lng: validation.data.checkin_lng ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("helper_id", helper.id)
      .eq("status", "dikonfirmasi")
      .select("id, status, helper_id, checkin_time, checkin_lat, checkin_lng")
      .maybeSingle();

    if (startError) {
      return createApiError("server_error", startError.message, 500);
    }

    if (!startedTask) {
      return createApiError("conflict", "Tugas sudah dimulai atau belum dikonfirmasi untuk akunmu", 409);
    }

    return apiResponse({
      message: "Check-in berhasil. Tugas sekarang sedang dikerjakan.",
      task: startedTask,
    });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Tugas belum dapat dimulai",
      500,
    );
  }
}

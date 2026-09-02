import { createAdminClient, createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import {
  canHelperAcceptTask,
  getTaskAcceptanceStatus,
} from "@/lib/helper/task-acceptance";

type RouteContext = { params: Promise<{ id: string }> };

type TaskRelations = {
  id: string;
  status: string;
  helper_id: string | null;
  expires_at: string | null;
  lansia_profiles: {
    lat: number | null;
    lng: number | null;
  } | null;
  service_categories: {
    is_high_risk: boolean;
  } | null;
};

function getDistanceKm(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
) {
  const radiusKm = 6371;
  const latitudeDelta = (targetLat - originLat) * (Math.PI / 180);
  const longitudeDelta = (targetLng - originLng) * (Math.PI / 180);
  const originLatitude = originLat * (Math.PI / 180);
  const targetLatitude = targetLat * (Math.PI / 180);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export async function PATCH(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk menerima tugas", 401);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat menerima tugas", 403);
    }

    const { data: helper, error: helperError } = await supabase
      .from("helper_profiles")
      .select("id, status, tingkat_kepercayaan, total_tugas_selesai, suspend_reason, domisili_lat, domisili_lng, radius_layanan_km")
      .eq("user_id", user.id)
      .single();

    if (helperError || !helper) {
      return createApiError("not_found", "Profil Helper tidak ditemukan", 404);
    }

    const taskWriter = await createAdminClient();
    const { data: taskRow, error: taskError } = await taskWriter
      .from("tasks")
      .select(`
        id, status, helper_id, expires_at, mode_penugasan,
        lansia_profiles ( lat, lng ),
        service_categories ( is_high_risk )
      `)
      .eq("id", taskId)
      .maybeSingle();

    if (taskError) {
      return createApiError("server_error", "Tugas belum dapat diperiksa", 500);
    }

    if (!taskRow) {
      return createApiError("not_found", "Tugas tidak ditemukan atau sudah tidak tersedia", 404);
    }

    const task = taskRow as unknown as TaskRelations & { mode_penugasan?: string };

    // Mode Cepat handling via RPC
    if (task.mode_penugasan === "cepat") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcResult, error: rpcErr } = await (supabase as any).rpc("accept_quick_task", {
        p_task_id: taskId,
        p_helper_user_id: user.id,
      });

      if (rpcErr) {
        return createApiError("server_error", rpcErr.message, 500);
      }

      const res = (rpcResult || {}) as { success: boolean; code?: string; message: string };
      if (!res.success) {
        const httpStatus = res.code === "race_condition_lost" || res.code === "task_already_assigned" || res.code === "task_expired" ? 409 : 403;
        return createApiError(res.code || "forbidden", res.message, httpStatus);
      }

      return apiResponse({
        message: res.message,
        task: { id: taskId, status: "dikonfirmasi", helper_id: helper.id },
      }, 200);
    }

    if (
      !canHelperAcceptTask(task.status, task.helper_id, helper.id) ||
      (task.expires_at && new Date(task.expires_at).getTime() <= Date.now())
    ) {
      return createApiError("conflict", "Tugas ini sudah diambil atau tidak lagi tersedia", 409);
    }

    if (helper.status !== "verified") {
      return createApiError("forbidden", "Profil Helper belum diverifikasi atau sedang ditinjau", 403);
    }

    const originLat = Number(helper.domisili_lat);
    const originLng = Number(helper.domisili_lng);
    const targetLat = Number(task.lansia_profiles?.lat);
    const targetLng = Number(task.lansia_profiles?.lng);
    const radius = Number(helper.radius_layanan_km);

    if ([originLat, originLng, targetLat, targetLng, radius].every(Number.isFinite)) {
      const distanceKm = getDistanceKm(originLat, originLng, targetLat, targetLng);
      if (distanceKm > radius) {
        return createApiError("forbidden", "Lokasi tugas berada di luar radius layanan Anda", 403);
      }
    }

    const nextStatus = getTaskAcceptanceStatus({
      helperStatus: helper.status,
      tingkatKepercayaan: helper.tingkat_kepercayaan,
      totalTugasSelesai: helper.total_tugas_selesai,
      suspendReason: helper.suspend_reason,
      isHighRisk: Boolean(task.service_categories?.is_high_risk),
    });

    if (!nextStatus) {
      return createApiError("forbidden", "Helper belum memenuhi syarat menerima tugas", 403);
    }

    let acceptQuery = taskWriter
      .from("tasks")
      .update({
        helper_id: helper.id,
        status: nextStatus,
      })
      .eq("id", taskId)
      .eq("status", "diajukan");

    acceptQuery = task.helper_id === null
      ? acceptQuery.is("helper_id", null)
      : acceptQuery.eq("helper_id", helper.id);

    const { data: acceptedTask, error: acceptError } = await acceptQuery
      .select("id, status, helper_id")
      .maybeSingle();

    if (acceptError) {
      return createApiError("server_error", "Tugas belum dapat diterima", 500);
    }

    if (!acceptedTask) {
      return createApiError("conflict", "Tugas baru saja diambil Helper lain", 409);
    }

    return apiResponse({
      message: nextStatus === "menunggu_persetujuan_koordinator"
        ? "Tugas diterima dan menunggu persetujuan Koordinator"
        : "Tugas berhasil diterima",
      task: acceptedTask,
    }, 200);
  } catch {
    return createApiError("server_error", "Tugas belum dapat diterima", 500);
  }
}

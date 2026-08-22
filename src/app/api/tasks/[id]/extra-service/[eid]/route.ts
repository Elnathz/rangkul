import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { extraServiceDecisionSchema } from "@/lib/validations/extra-service";

type RouteContext = { params: Promise<{ id: string; eid: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: taskId, eid: extraServiceId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk memutuskan layanan tambahan", 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "keluarga") {
      return createApiError("forbidden", "Hanya Keluarga yang dapat memutuskan layanan tambahan", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createApiError("validation_error", "Keputusan layanan tambahan tidak valid", 400);
    }

    const validation = extraServiceDecisionSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: "validation_error",
        message: "Keputusan harus disetujui atau ditolak",
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const { data: task, error: decisionError } = await supabase.rpc("decide_extra_service", {
      p_task_id: taskId,
      p_extra_service_id: extraServiceId,
      p_decision: validation.data.decision,
    });

    if (decisionError) {
      const isConflict = decisionError.code === "P0001";
      return createApiError(
        isConflict ? "conflict" : "server_error",
        isConflict ? decisionError.message : "Keputusan layanan tambahan belum dapat disimpan",
        isConflict ? 409 : 500,
      );
    }

    return apiResponse({
      message: validation.data.decision === "disetujui"
        ? "Layanan tambahan disetujui dan tugas dapat dilanjutkan"
        : "Layanan tambahan ditolak dan tugas dapat dilanjutkan",
      task,
      status: task?.status ?? "dikerjakan",
    });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Keputusan layanan tambahan belum dapat disimpan",
      500,
    );
  }
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { cancelTaskSchema } from "@/lib/validations/task-scheduling";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk membatalkan tugas", 401);

    let body: unknown;
    try { body = await request.json(); } catch { return createApiError("validation_error", "Alasan pembatalan wajib diisi", 400); }
    const validation = cancelTaskSchema.safeParse(body);
    if (!validation.success) return apiResponse({ error: "validation_error", message: "Alasan pembatalan belum lengkap", fieldErrors: validation.error.flatten().fieldErrors }, 422);

    const { data: task, error } = await supabase.rpc("cancel_task", { p_task_id: taskId, p_cancellation_reason: validation.data.cancellation_reason });
    if (error) return createApiError(error.code === "P0001" ? "conflict" : "server_error", error.message, error.code === "P0001" ? 409 : 500);
    return apiResponse({ message: "Tugas dibatalkan", task, status: "dibatalkan" });
  } catch (error: unknown) {
    return createApiError("server_error", error instanceof Error ? error.message : "Tugas belum dapat dibatalkan", 500);
  }
}

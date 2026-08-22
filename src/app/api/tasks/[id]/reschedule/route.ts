import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { rescheduleTaskSchema } from "@/lib/validations/task-scheduling";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengubah jadwal", 401);

    let body: unknown;
    try { body = await request.json(); } catch { return createApiError("validation_error", "Jadwal baru wajib diisi", 400); }
    const validation = rescheduleTaskSchema.safeParse(body);
    if (!validation.success) return apiResponse({ error: "validation_error", message: "Format jadwal baru tidak valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);

    const { data: task, error } = await supabase.rpc("reschedule_task", { p_task_id: taskId, p_jadwal_waktu: validation.data.jadwal_waktu });
    if (error) return createApiError(error.code === "P0001" ? "conflict" : "server_error", error.message, error.code === "P0001" ? 409 : 500);
    return apiResponse({ message: "Jadwal tugas diperbarui", task });
  } catch (error: unknown) {
    return createApiError("server_error", error instanceof Error ? error.message : "Jadwal belum dapat diubah", 500);
  }
}

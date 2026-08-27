import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { emergencySchema } from "@/lib/validations/communication";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengirim SOS", 401);
  const validation = emergencySchema.safeParse(await request.json().catch(() => null));
  if (!validation.success) return apiResponse({ error: "validation_error", message: "Task SOS belum valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);
  const { data: alert, error } = await supabase.rpc("create_emergency_alert", {
    p_task_id: validation.data.task_id,
  });
  if (error) {
    const status = error.code === "42501" ? 403 : error.code === "23505" ? 409 : 422;
    return createApiError(error.code === "23505" ? "conflict" : "forbidden", error.message, status);
  }
  return apiResponse({ alert, message: "Sinyal darurat sudah disimpan dan notifikasi dikirim" }, 201);
}

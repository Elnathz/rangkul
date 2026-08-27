import { apiResponse, createApiError } from "@/lib/api-response";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { emergencySchema } from "@/lib/validations/communication";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengirim SOS", 401);
  const validation = emergencySchema.safeParse(await request.json().catch(() => null));
  if (!validation.success) return apiResponse({ error: "validation_error", message: "Task SOS belum valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);
  const { data: task } = await supabase.from("tasks").select("id, keluarga_id, helper_id, status").eq("id", validation.data.task_id).maybeSingle();
  const { data: helper } = task?.helper_id ? await supabase.from("helper_profiles").select("user_id, koordinator_id").eq("id", task.helper_id).maybeSingle() : { data: null };
  if (!task || !helper || helper.user_id !== user.id || task.status !== "dikerjakan") return createApiError("forbidden", "SOS hanya dapat dikirim Helper yang sedang mengerjakan task", 403);
  const admin = await createAdminClient();
  const { data: alert, error } = await admin.from("emergency_alerts").insert({ task_id: task.id, triggered_by: user.id, status: "active" }).select().single();
  if (error) return createApiError("server_error", error.message, 500);
  const recipients = [task.keluarga_id];
  if (helper.koordinator_id) {
    const { data: coordinator } = await admin.from("koordinator_profiles").select("user_id").eq("id", helper.koordinator_id).maybeSingle();
    if (coordinator?.user_id) recipients.push(coordinator.user_id);
  }
  await admin.from("notifications").insert(recipients.map((userId) => ({ user_id: userId, title: "Sinyal darurat aktif", body: "Helper memerlukan perhatian untuk task ini.", type: "emergency" as const })));
  return apiResponse({ alert, message: "Sinyal darurat sudah disimpan dan notifikasi dikirim" }, 201);
}

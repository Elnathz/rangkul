import { apiResponse, createApiError } from "@/lib/api-response";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  void request;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengakui SOS", 401);
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["keluarga", "koordinator", "admin"].includes(profile.role)) return createApiError("forbidden", "Role ini tidak dapat mengakui SOS", 403);
  const { data: alert } = await supabase.from("emergency_alerts").select("id, task_id, status").eq("id", id).maybeSingle();
  if (!alert) return createApiError("not_found", "Sinyal darurat tidak ditemukan", 404);
  const admin = await createAdminClient();
  const { data: updated, error } = await admin.from("emergency_alerts").update({ status: "acknowledged", acknowledged_by: user.id, acknowledged_at: new Date().toISOString() }).eq("id", id).eq("status", "active").select().maybeSingle();
  if (error) return createApiError("server_error", error.message, 500);
  if (!updated) return createApiError("conflict", "Sinyal darurat sudah diakui", 409);
  return apiResponse({ alert: updated });
}

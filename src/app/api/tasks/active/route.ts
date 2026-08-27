import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login", 401);
  const { data: helper } = await supabase.from("helper_profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (!helper) return createApiError("forbidden", "Profil Helper tidak ditemukan", 403);
  const { data: task, error } = await supabase.from("tasks").select("id, status, lansia_id, keluarga_id").eq("helper_id", helper.id).eq("status", "dikerjakan").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return createApiError("server_error", error.message, 500);
  return apiResponse({ task: task || null });
}

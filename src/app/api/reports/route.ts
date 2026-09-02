import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validations/communication";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk membuat laporan", 401);
  const validation = reportSchema.safeParse(await request.json().catch(() => null));
  if (!validation.success) return apiResponse({ error: "validation_error", message: "Laporan belum valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);
  const { data: relatedTask } = await supabase.from("tasks").select("id, helper_id").eq("id", validation.data.task_id).eq("keluarga_id", user.id).maybeSingle();
  if (!relatedTask?.helper_id) return createApiError("forbidden", "Laporan hanya dapat dibuat untuk tugas milik Anda", 403);
  const { data: helper } = await supabase.from("helper_profiles").select("user_id").eq("id", relatedTask.helper_id).maybeSingle();
  if (!helper) return createApiError("not_found", "Helper tidak ditemukan", 404);
  const { data: report, error } = await supabase.from("reports").insert({ reported_helper_id: helper.user_id, reporter_id: user.id, alasan: validation.data.alasan }).select().single();
  if (error) return createApiError("server_error", "Laporan belum dapat dikirim", 500);
  return apiResponse({ data: { report }, message: "Laporan diterima dan akan ditinjau" }, 201);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk melihat laporan", 401);
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  let query = supabase.from("reports").select("id, reported_helper_id, reporter_id, alasan, status, ditindak_oleh, created_at, updated_at").order("created_at", { ascending: false });
  if (profile?.role === "keluarga") query = query.eq("reporter_id", user.id);
  else if (profile?.role === "koordinator") {
    const { data: coordinator } = await supabase.from("koordinator_profiles").select("id").eq("user_id", user.id).maybeSingle();
    const { data: helpers } = coordinator ? await supabase.from("helper_profiles").select("user_id").eq("koordinator_id", coordinator.id) : { data: [] };
    query = query.in("reported_helper_id", (helpers || []).map((helper) => helper.user_id));
  } else if (profile?.role !== "admin") return createApiError("forbidden", "Role ini tidak dapat melihat laporan", 403);
  const { data: reports, error } = await query;
  if (error) return createApiError("server_error", "Laporan belum dapat dimuat", 500);
  return apiResponse({ data: { reports: reports || [] } });
}

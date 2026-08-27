import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { reportUpdateSchema } from "@/lib/validations/communication";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk menindak laporan", 401);
  const validation = reportUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!validation.success) return apiResponse({ error: "validation_error", message: "Status laporan belum valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "koordinator") return createApiError("forbidden", "Hanya Koordinator atau Admin yang dapat menindak laporan", 403);
  const { data: report, error } = await supabase.from("reports").update({ status: validation.data.status, ditindak_oleh: user.id, updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
  if (error) return createApiError("server_error", error.message, 500);
  if (!report) return createApiError("not_found", "Laporan tidak ditemukan", 404);
  return apiResponse({ report });
}

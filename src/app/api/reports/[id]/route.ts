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
  const { data: report, error } = await supabase.rpc("review_report", {
    p_report_id: id,
    p_status: validation.data.status,
    p_helper_status: validation.data.helper_status,
    p_decision_reason: validation.data.decision_reason,
  });
  if (error) {
    const status = error.code === "P0002" ? 404 : error.code === "P0001" ? 409 : error.code === "42501" ? 403 : error.code === "22023" ? 422 : 500;
    const code = status === 404 ? "not_found" : status === 409 ? "conflict" : status === 403 ? "forbidden" : status === 422 ? "validation_error" : "server_error";
    const message = status === 409 ? "Laporan sudah diputus reviewer lain atau masih memiliki laporan aktif" : status === 403 ? "Anda tidak memiliki scope untuk laporan ini" : status === 404 ? "Laporan tidak ditemukan" : status === 422 ? "Keputusan laporan tidak valid" : "Keputusan laporan belum dapat disimpan";
    return createApiError(code, message, status);
  }
  return apiResponse({ data: { report } });
}

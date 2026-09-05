import { createApiError, apiResponse } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("messages").select("id, task_id, created_at").limit(1);
    if (error) return createApiError("server_error", "Pemeriksaan debug gagal", 500);
    return apiResponse({ data: data ?? [] });
  } catch (error: unknown) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

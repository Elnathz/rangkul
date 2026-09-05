import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    let query = supabase
      .from("appeals")
      .select("id, user_id, alasan, status, review_reason, direview_oleh, direview_at, created_at, user:users!appeals_user_id_fkey(id, full_name, email, account_status), reviewer:users!appeals_direview_oleh_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (status && ["menunggu", "disetujui", "ditolak"].includes(status)) {
      query = query.eq("status", status as "menunggu" | "disetujui" | "ditolak");
    }
    const { data, error } = await query;
    if (error) return createApiError("server_error", "Gagal mengambil data banding", 500);
    return apiResponse({ data: data ?? [] });
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

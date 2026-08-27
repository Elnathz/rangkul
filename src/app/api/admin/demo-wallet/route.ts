import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("demo_wallets")
      .select("id, user_id, saldo, updated_at, user:users!demo_wallets_user_id_fkey(id, full_name, email, username)")
      .order("updated_at", { ascending: false });
    if (error) return createApiError("server_error", "Gagal mengambil wallet demo", 500);
    return apiResponse({ data: data ?? [] });
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

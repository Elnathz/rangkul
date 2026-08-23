import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "25"), 1), 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, metadata, created_at, actor:actor_id ( id, full_name, email )", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return createApiError("server_error", "Gagal mengambil audit log", 500);
    return apiResponse({ data: data ?? [], total: count ?? 0, page, pageSize });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

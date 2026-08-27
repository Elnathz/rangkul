import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";

const helperStatuses = new Set(["pending_verification", "verified", "under_review", "rejected", "suspended"]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const admin = await createAdminClient();
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "25"), 1), 100);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("q")?.trim().replace(/[%,()]/g, " ");
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = admin
      .from("helper_profiles")
      .select("id, user_id, bio, wilayah_domisili, radius_layanan_km, koordinator_id, verified_by_admin_fallback, status, tingkat_kepercayaan, suspend_reason, rating_avg, total_tugas_selesai, created_at, updated_at, user:users!helper_profiles_user_id_fkey(id, full_name, email, phone, username, account_status)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status && helperStatuses.has(status)) query = query.eq("status", status as "pending_verification" | "verified" | "under_review" | "rejected" | "suspended");
    if (search) query = query.or(`wilayah_domisili.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) return createApiError("server_error", "Gagal mengambil data Helper", 500);
    return apiResponse({ data: data ?? [], total: count ?? 0, page, pageSize });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export const allowedHelperStatuses = helperStatuses;

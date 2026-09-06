import { createApiError, apiResponse } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const users = await supabase.from("users").select("id", { count: "exact", head: true });
    const activeUsers = await supabase.from("users").select("id", { count: "exact", head: true }).eq("account_status", "active");
    const helpers = await supabase.from("helper_profiles").select("id", { count: "exact", head: true });
    const verifiedHelpers = await supabase.from("helper_profiles").select("id", { count: "exact", head: true }).eq("status", "verified");
    const pendingCoordinators = await supabase.from("koordinator_profiles").select("id", { count: "exact", head: true }).eq("status", "pending_verification");
    const underReviewHelpers = await supabase.from("helper_profiles").select("id", { count: "exact", head: true }).eq("status", "under_review");
    const tasks = await supabase.from("tasks").select("id", { count: "exact", head: true });
    const reports = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "menunggu");
    const pendingAppeals = await supabase.from("appeals").select("id", { count: "exact", head: true }).eq("status", "menunggu");
    const taskRows = await supabase.from("tasks").select("status");
    const releasedPayments = await supabase.from("payments").select("jumlah_total").eq("status", "released");
    const auditLogs = await supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, metadata, created_at, actor:actor_id ( full_name )")
      .order("created_at", { ascending: false })
      .limit(5);

    const countErrors = [users, activeUsers, helpers, verifiedHelpers, pendingCoordinators, underReviewHelpers, tasks, reports, pendingAppeals].filter(
      (result) => result.error,
    );
    const rowErrors = [taskRows, releasedPayments, auditLogs].filter((result) => result.error);
    if (countErrors.length || rowErrors.length) {
      return createApiError("server_error", "Gagal mengambil ringkasan data Admin", 500);
    }

    const taskBreakdown = (taskRows.data ?? []).reduce<Record<string, number>>((result, row) => {
      result[row.status] = (result[row.status] ?? 0) + 1;
      return result;
    }, {});

    // GMV hanya menghitung transaksi yang benar-benar released/settled, bukan tugas selesai tanpa pembayaran.
    const gmv = (releasedPayments.data ?? []).reduce(
      (total, row) => total + Number(row.jumlah_total ?? 0),
      0,
    );

    return apiResponse({
      data: {
        counts: {
          users: users.count ?? 0,
          activeUsers: activeUsers.count ?? 0,
          helpers: helpers.count ?? 0,
          verifiedHelpers: verifiedHelpers.count ?? 0,
          pendingCoordinators: pendingCoordinators.count ?? 0,
          underReviewHelpers: underReviewHelpers.count ?? 0,
          tasks: tasks.count ?? 0,
          pendingReports: reports.count ?? 0,
          pendingAppeals: pendingAppeals.count ?? 0,
        },
        taskBreakdown,
        gmv,
        recentAuditLogs: auditLogs.data ?? [],
      },
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

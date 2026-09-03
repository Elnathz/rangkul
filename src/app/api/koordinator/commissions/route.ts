import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    // Verify koordinator role & profile
    const { data: profile } = await supabase
      .from("koordinator_profiles")
      .select("id, wilayah, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "verified") {
      return createApiError("forbidden", "Hanya Koordinator terverifikasi yang dapat mengakses data komisi", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const offset = (page - 1) * limit;

    const adminSupabase = await createAdminClient();

    // Fetch payments with task join, scoped to Koordinator's wilayah
    // Chain: payments.task_id → tasks.helper_id → helper_profiles.koordinator_id
    let query = adminSupabase
      .from("payments")
      .select(`
        id,
        task_id,
        jumlah_total,
        koordinator_share,
        status,
        released_at,
        created_at,
        tasks!inner (
          id,
          keluarga_id,
          helper_id,
          status,
          service_categories ( nama ),
          helper_profiles!inner ( koordinator_id )
        )
      `, { count: "exact" })
      .eq("status", "released")
      .eq("tasks.helper_profiles.koordinator_id", profile.id);

    if (fromDate) {
      query = query.gte("released_at", fromDate);
    }
    if (toDate) {
      query = query.lte("released_at", toDate);
    }

    const { data: payments, count, error } = await query
      .order("released_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Commissions query error:", error);
      return createApiError("server_error", "Gagal mengambil data komisi", 500);
    }

    const items = (payments || []).map((p: Record<string, unknown>) => {
      const taskObj = p.tasks as { service_categories?: { nama?: string } | null; helper_profiles?: { koordinator_id?: string } | null } | null;
      return {
        id: p.id as string,
        task_id: p.task_id as string,
        layanan: taskObj?.service_categories?.nama || "Pendampingan",
        jumlah_total: p.jumlah_total as number,
        koordinator_share: p.koordinator_share as number,
        released_at: (p.released_at || p.created_at) as string,
      };
    });

    const totalCommission = items.reduce((sum, item) => sum + Number(item.koordinator_share || 0), 0);
    const totalTransactions = count || 0;

    return apiResponse({
      summary: {
        total_commission: totalCommission,
        total_transactions: totalTransactions,
      },
      items,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        total_pages: Math.ceil(totalTransactions / limit),
      },
    }, 200);

  } catch (error: unknown) {
    console.error("Koordinator commissions API error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

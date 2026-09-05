import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import { marketplaceQuerySchema } from "@/lib/validations/task-marketplace";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    if (!isSprint6MatchingEnabled()) {
      return createApiError("not_found", "Fitur belum tersedia", 404);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return createApiError("server_error", "Profil pengguna tidak dapat dibaca", 500);
    }

    if (userProfile?.role !== "helper") {
      return createApiError("forbidden", "Marketplace hanya tersedia untuk Helper", 403);
    }

    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get("mode") || undefined;
    const limitParam = searchParams.get("limit") || undefined;

    const validation = marketplaceQuerySchema.safeParse({
      mode: modeParam,
      limit: limitParam,
    });

    if (!validation.success) {
      return createApiError("validation_error", "Parameter query tidak valid", 422);
    }

    const { mode, limit } = validation.data;
    const { data: tasks, error: rpcError } = await supabase.rpc("get_task_marketplace", {
      p_mode: mode,
      p_limit: limit,
    });

    if (rpcError) {
      console.error("Marketplace RPC error:", rpcError);
      return createApiError("server_error", "Gagal mengambil daftar tugas marketplace", 500);
    }

    return apiResponse({
      data: tasks || [],
    }, 200);

  } catch (error: unknown) {
    console.error("Marketplace API error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

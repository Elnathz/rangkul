import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk membatalkan pengajuan", 401);
    }

    if (!isSprint6MatchingEnabled()) {
      return createApiError("not_found", "Fitur belum tersedia", 404);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat membatalkan pengajuan tugas", 403);
    }

    // Call atomic RPC withdraw_task_application
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error: rpcError } = await (supabase as any).rpc("withdraw_task_application", {
      p_task_id: taskId,
    });

    if (rpcError) {
      console.error("withdraw_task_application RPC error:", rpcError);
      return createApiError("server_error", rpcError.message, 500);
    }

    const res = (result || {}) as { success: boolean; code?: string; message: string };
    if (!res.success) {
      const code = res.code || "forbidden";
      let status = 403;
      if (code === "application_not_found" || code === "helper_not_found") status = 404;
      else if (code === "application_not_pending") status = 409;
      return createApiError(code, res.message, status);
    }

    return apiResponse({
      message: res.message,
    }, 200);
  } catch (error: unknown) {
    console.error("Withdraw application API error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

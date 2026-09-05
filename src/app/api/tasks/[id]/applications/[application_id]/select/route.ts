import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";

type RouteContext = {
  params: Promise<{
    id: string;
    application_id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId, application_id: applicationId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk memilih Helper", 401);
    }

    if (!isSprint6MatchingEnabled()) {
      return createApiError("not_found", "Fitur belum tersedia", 404);
    }

    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userProfile?.role !== "keluarga") {
      return createApiError("forbidden", "Hanya akun Keluarga yang dapat memilih Helper", 403);
    }

    // Call atomic RPC select_task_application
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error: rpcError } = await (supabase as any).rpc(
      "select_task_application",
      {
        p_task_id: taskId,
        p_application_id: applicationId,
      }
    );

    if (rpcError) {
      console.error("select_task_application RPC error:", rpcError);
      return createApiError("server_error", rpcError.message, 500);
    }

    const res = (result || {}) as {
      success: boolean;
      code?: string;
      message: string;
      status_tugas?: string;
      helper_id?: string;
    };

    if (!res.success) {
      const code = res.code || "forbidden";
      let status = 403;
      if (code === "task_not_found" || code === "application_not_found") {
        status = 404;
      } else if (
        code === "task_not_available" ||
        code === "application_not_pending" ||
        code === "schedule_conflict"
      ) {
        status = 409;
      }
      return createApiError(code, res.message, status);
    }

    return apiResponse(
      {
        message: res.message,
        status_tugas: res.status_tugas,
        helper_id: res.helper_id,
      },
      200
    );
  } catch (error: unknown) {
    console.error("Select application API error:", error);
    return createApiError(
      "server_error",
      (error as Error).message || "Terjadi kesalahan server",
      500
    );
  }
}

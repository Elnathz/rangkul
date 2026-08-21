import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  void request;

  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengonfirmasi tugas", 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "keluarga") {
      return createApiError("forbidden", "Hanya Keluarga yang dapat mengonfirmasi tugas", 403);
    }

    const { data: task, error: confirmError } = await supabase.rpc("confirm_task_completion", {
      p_task_id: taskId,
    });

    if (confirmError) {
      const isConflict = confirmError.code === "P0001";
      return createApiError(
        isConflict ? "conflict" : "server_error",
        isConflict ? confirmError.message : "Tugas belum dapat dikonfirmasi",
        isConflict ? 409 : 500,
      );
    }

    return apiResponse({ message: "Kunjungan sudah berstatus selesai. Release pembayaran menunggu Demo Ledger.", task, status: "selesai" });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Tugas belum dapat dikonfirmasi",
      500,
    );
  }
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  void request;
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk menyelesaikan tugas", 401);
    const { data: payment, error } = await supabase.rpc("release_task_payment", { p_task_id: id });
    if (error) return createApiError(error.code === "P0001" ? "conflict" : "server_error", error.message, error.code === "P0001" ? 409 : 500);
    return apiResponse({ message: "Pembayaran berhasil dicairkan", payment, status: "released" });
  } catch (error: unknown) {
    return createApiError("server_error", error instanceof Error ? error.message : "Pembayaran belum dapat dicairkan", 500);
  }
}

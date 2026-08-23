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

    const { data: payment, error: releaseError } = await supabase.rpc("release_task_payment", { p_task_id: taskId });
    if (releaseError) {
      return createApiError(releaseError.code === "P0001" ? "conflict" : "server_error", releaseError.message, releaseError.code === "P0001" ? 409 : 500);
    }
    return apiResponse({ message: "Kunjungan selesai dan pembayaran dicairkan", task: null, payment, status: "released" });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Tugas belum dapat dikonfirmasi",
      500,
    );
  }
}

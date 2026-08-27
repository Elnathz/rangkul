import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ task_id: string }> };

export async function GET(request: Request, context: RouteContext) {
  void request;
  const { task_id: taskId } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk melihat pembayaran", 401);

  const { data: task } = await supabase.from("tasks").select("id").eq("id", taskId).eq("keluarga_id", user.id).maybeSingle();
  if (!task) return createApiError("not_found", "Tugas tidak ditemukan", 404);
  const { data: payment, error } = await supabase.from("payments").select("id, task_id, amount, jumlah_total, helper_share, platform_fee, koordinator_share, status, payment_method, gateway_ref, midtrans_order_id, midtrans_snap_token, held_at, released_at, updated_at").eq("task_id", taskId).maybeSingle();
  if (error) return createApiError("server_error", error.message, 500);
  return apiResponse({ payment });
}

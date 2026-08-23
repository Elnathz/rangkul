import { apiResponse, createApiError } from "@/lib/api-response";
import { refundMidtrans } from "@/lib/midtrans";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ task_id: string }> };

export async function POST(request: Request, context: RouteContext) {
  void request;
  try {
    const { task_id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk meminta refund", 401);
    const { data: actor } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    if (actor?.role !== "admin") return createApiError("forbidden", "Refund manual hanya dapat diproses Admin", 403);
    const { data: payment } = await supabase.from("payments").select("id, task_id, amount, status, midtrans_order_id").eq("task_id", taskId).maybeSingle();
    const { data: task } = await supabase.from("tasks").select("id, status, keluarga_id").eq("id", taskId).maybeSingle();
    if (!task || !payment) return createApiError("not_found", "Pembayaran tidak ditemukan", 404);
    if (task.status !== "dibatalkan" || payment.status !== "held_escrow" || !payment.midtrans_order_id) return createApiError("conflict", "Refund hanya tersedia untuk pembayaran held pada tugas yang dibatalkan", 409);
    const refund = await refundMidtrans(payment.midtrans_order_id, Number(payment.amount), `refund-${payment.id}`);
    const { data: updated, error } = await supabase.rpc("refund_midtrans_payment", { p_task_id: taskId, p_gateway_ref: payment.midtrans_order_id, p_payload: refund });
    if (error) return createApiError("server_error", error.message, 500);
    return apiResponse({ message: "Refund Midtrans diajukan", payment: updated, refund });
  } catch (error: unknown) {
    return createApiError("refund_error", error instanceof Error ? error.message : "Refund gagal diproses", 502);
  }
}

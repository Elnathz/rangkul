import { apiResponse, createApiError } from "@/lib/api-response";
import { createMidtransCheckout } from "@/lib/midtrans";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ task_id: string }> };

export async function POST(request: Request, context: RouteContext) {
  void request;
  try {
    const { task_id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk membayar tugas", 401);

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, keluarga_id, harga_final, status")
      .eq("id", taskId)
      .eq("keluarga_id", user.id)
      .maybeSingle();
    if (taskError || !task) return createApiError("not_found", "Tugas tidak ditemukan", 404);
    if (!["dikonfirmasi", "dikerjakan", "selesai"].includes(task.status)) {
      return createApiError("conflict", "Tugas belum berada pada tahap pembayaran", 409);
    }

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, task_id, amount, jumlah_total, status, payment_method, midtrans_order_id, midtrans_snap_token, held_at, released_at")
      .eq("task_id", taskId)
      .maybeSingle();
    if (existingPayment?.status === "held_escrow" || existingPayment?.status === "released") {
      return apiResponse({ payment: existingPayment, provider: "midtrans_sandbox" });
    }
    if (existingPayment?.status === "pending" && existingPayment.midtrans_order_id && existingPayment.midtrans_snap_token) {
      return apiResponse({ payment: existingPayment, checkout: { order_id: existingPayment.midtrans_order_id, token: existingPayment.midtrans_snap_token }, provider: "midtrans_sandbox" });
    }

    const { data: profile } = await supabase.from("users").select("full_name, email, phone").eq("id", user.id).single();
    const orderId = `RANGKUL-${taskId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const checkout = await createMidtransCheckout({
      orderId,
      amount: Number(task.harga_final),
      customer: { name: profile?.full_name || "Keluarga Rangkul", email: profile?.email || user.email || "", phone: profile?.phone },
    });

    const { data: payment, error: prepareError } = await supabase.rpc("create_midtrans_payment", {
      p_task_id: taskId,
      p_order_id: checkout.order_id,
      p_snap_token: checkout.token,
      p_amount: Number(task.harga_final),
    });
    if (prepareError) {
      return createApiError(prepareError.code === "P0001" ? "conflict" : "server_error", prepareError.message, prepareError.code === "P0001" ? 409 : 500);
    }
    return apiResponse({ payment, checkout, provider: "midtrans_sandbox" }, 201);
  } catch (error: unknown) {
    return createApiError("payment_provider_error", error instanceof Error ? error.message : "Checkout Midtrans gagal dibuat", 502);
  }
}

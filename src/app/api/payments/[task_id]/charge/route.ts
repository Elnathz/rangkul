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

    // 1. Prepare payment intent and get deterministic order ID
    const { data: pendingPayment, error: prepareError } = await supabase.rpc("prepare_midtrans_payment_intent", {
      p_task_id: taskId,
      p_amount: Number(task.harga_final),
    });

    if (prepareError) {
      if (prepareError.code === "23505") {
        // Payment sudah diproses
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("id, task_id, amount, jumlah_total, status, payment_method, midtrans_order_id, midtrans_snap_token, held_at, released_at")
          .eq("task_id", taskId)
          .single();
        return apiResponse({ payment: existingPayment, provider: "midtrans_sandbox" });
      }
      return createApiError(prepareError.code === "P0001" ? "conflict" : "server_error", prepareError.message, prepareError.code === "P0001" ? 409 : 500);
    }

    // Jika sudah ada snap token dari attempt sebelumnya yang valid
    if (pendingPayment.midtrans_snap_token) {
      return apiResponse({
        payment: pendingPayment,
        checkout: { order_id: pendingPayment.midtrans_order_id, token: pendingPayment.midtrans_snap_token },
        provider: "midtrans_sandbox",
      }, 201);
    }

    // 2. Call Midtrans
    const { data: profile } = await supabase.from("users").select("full_name, email, phone").eq("id", user.id).single();
    
    const checkout = await createMidtransCheckout({
      orderId: pendingPayment.midtrans_order_id!,
      amount: Number(task.harga_final),
      customer: { name: profile?.full_name || "Keluarga Rangkul", email: profile?.email || user.email || "", phone: profile?.phone },
    });

    // 3. Save the token
    const { data: finalPayment, error: saveError } = await supabase.rpc("save_midtrans_snap_token", {
      p_task_id: taskId,
      p_order_id: checkout.order_id,
      p_snap_token: checkout.token,
    });

    if (saveError) {
      return createApiError("server_error", "Gagal menyimpan token pembayaran", 500);
    }

    return apiResponse({ payment: finalPayment, checkout, provider: "midtrans_sandbox" }, 201);
  } catch (error: unknown) {
    return createApiError("payment_provider_error", error instanceof Error ? error.message : "Checkout Midtrans gagal dibuat", 502);
  }
}


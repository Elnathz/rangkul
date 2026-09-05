import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

// POST /api/payments/[task_id]/demo-wallet/charge
// Membayar task memakai Saldo Demo. Semua debit dan pencatatan berada dalam satu
// transaksi di RPC charge_task_with_demo_wallet, tidak memercayai nominal browser.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ task_id: string }> }
) {
  try {
    const { task_id: taskId } = await params;
    const body = await request.json().catch(() => ({}));

    const idempotencyKey =
      typeof body?.idempotency_key === "string" && body.idempotency_key.length > 0
        ? body.idempotency_key
        : null;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    const { data, error } = await supabase.rpc("charge_task_with_demo_wallet", {
      p_task_id: taskId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const code = error.code;
      if (code === "42501") {
        return createApiError("forbidden", "Anda tidak memiliki akses ke tugas ini", 403);
      }
      if (code === "40900") {
        return createApiError("conflict", "Tugas ini sudah memiliki pembayaran berjalan melalui metode lain atau berada di tahap yang belum bisa dibayar.", 409);
      }
      if (code === "45001") {
        const balance = Number((error.details || "").split(" = ")[1] || 0);
        return createApiError(
          "insufficient_balance",
          `Saldo Demo Anda (Rp ${balance.toLocaleString("id-ID")}) tidak mencukupi untuk pembayaran tugas ini.`,
          422
        );
      }
      return createApiError("server_error", error.message || "Terjadi kesalahan server", 500);
    }

    const payment = data?.[0];

    return apiResponse({
      message: "Pembayaran Saldo Demo berhasil. Dana ditahan di escrow.",
      payment: { id: payment?.payment_id, status: payment?.status },
      saldo_tersisa: Number(payment?.saldo_tersisa || 0),
    }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}
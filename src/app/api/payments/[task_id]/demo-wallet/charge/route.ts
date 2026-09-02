import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ task_id: string }> }
) {
  try {
    const { task_id: taskId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    // Load task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, keluarga_id, harga_final, status")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return createApiError("not_found", "Tugas tidak ditemukan", 404);
    }

    if (task.keluarga_id !== user.id) {
      return createApiError("forbidden", "Anda tidak memiliki akses ke tugas ini", 403);
    }

    const adminSupabase = await createAdminClient();

    // Check payment record
    const { data: existingPayment } = await adminSupabase
      .from("payments")
      .select("*")
      .eq("task_id", taskId)
      .maybeSingle();

    if (existingPayment?.status === "held_escrow" || existingPayment?.status === "released") {
      return createApiError("conflict", "Tugas ini sudah dibayar", 409);
    }

    const chargeAmount = Number(task.harga_final);

    // Check demo wallet balance
    let { data: wallet } = await adminSupabase
      .from("demo_wallets")
      .select("id, saldo")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet } = await adminSupabase
        .from("demo_wallets")
        .insert({ user_id: user.id, saldo: 0 })
        .select()
        .single();
      wallet = newWallet;
    }

    const currentBalance = Number(wallet?.saldo || 0);

    if (currentBalance < chargeAmount) {
      return createApiError(
        "insufficient_balance",
        `Saldo Demo Anda (Rp ${currentBalance.toLocaleString("id-ID")}) tidak mencukupi untuk pembayaran sebesar Rp ${chargeAmount.toLocaleString("id-ID")}.`,
        422
      );
    }

    // Atomic debit & payment update
    const newBalance = currentBalance - chargeAmount;

    // 1. Update wallet balance
    if (wallet) {
      await adminSupabase
        .from("demo_wallets")
        .update({ saldo: newBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);
    }

    // 2. Insert ledger entry (table name is demo_wallet_ledger)
    if (wallet) {
      await adminSupabase.from("demo_wallet_ledger").insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: -chargeAmount,
        saldo_setelah: newBalance,
        alasan: `Pembayaran tugas ${taskId.slice(0, 8)} dengan Saldo Demo`,
        created_by: user.id,
      });
    }

    // 3. Calculate split shares (90% helper, 7% platform, 3% koordinator)
    const helperShare = Math.round(chargeAmount * 0.90);
    const platformFee = Math.round(chargeAmount * 0.07);
    const koordinatorShare = chargeAmount - helperShare - platformFee;

    // 4. Upsert payment record
    const { data: updatedPayment, error: paymentUpdateError } = await adminSupabase
      .from("payments")
      .upsert({
        task_id: taskId,
        amount: chargeAmount,
        jumlah_total: chargeAmount,
        helper_share: helperShare,
        platform_fee: platformFee,
        koordinator_share: koordinatorShare,
        status: "held_escrow",
        payment_method: "saldo_demo",
        held_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "task_id" })
      .select("*")
      .single();

    if (paymentUpdateError || !updatedPayment) {
      console.error("Payment charge error:", paymentUpdateError);
      return createApiError("server_error", "Gagal memperbarui status pembayaran", 500);
    }

    // 5. Create transaction log
    await adminSupabase.from("transaction_logs").insert({
      payment_id: updatedPayment.id,
      event_type: "held",
      payload: {
        method: "saldo_demo",
        amount: chargeAmount,
        actor_id: user.id,
        task_id: taskId,
      },
    });

    return apiResponse({
      message: "Pembayaran Saldo Demo berhasil. Dana ditahan di escrow.",
      payment: updatedPayment,
      saldo_tersisa: newBalance,
    }, 200);

  } catch (error: unknown) {
    console.error("Demo wallet charge error:", error);
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

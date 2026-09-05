import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { demoWalletTopupSchema } from "@/lib/validations/demo-wallet";
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return createApiError("unauthorized", "Sesi tidak valid", 401);
    }

    const parsed = demoWalletTopupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiResponse(
        {
          error: "validation_error",
          message: "Data top up tidak valid",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        422,
      );
    }

    const { data: ledger, error } = await supabase.rpc("keluarga_self_topup_demo_wallet", {
      topup_amount: parsed.data.amount,
      topup_reason: "Self top-up demo oleh keluarga",
    });

    if (error) {
      if (error.code === "42501") {
        return createApiError("forbidden", "Hanya akun Keluarga yang dapat mengisi saldo", 403);
      }

      if (error.code === "22023") {
        return createApiError("validation_error", "Nominal top up tidak valid", 422);
      }

      return createApiError("server_error", "Top up saldo belum dapat diproses", 500);
    }

    if (!ledger) {
      return createApiError("server_error", "Top up tidak menghasilkan catatan transaksi", 500);
    }

    return apiResponse(
      {
        message: `Saldo demo Rp ${parsed.data.amount.toLocaleString("id-ID")} berhasil ditambahkan`,
        saldo: ledger.saldo_setelah,
        ledger_id: ledger.id,
      },
      201,
    );
  } catch {
    return createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createApiError("unauthorized", "Sesi tidak valid", 401);

    const { data: wallet, error } = await supabase
      .from("demo_wallets")
      .select("saldo, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return createApiError("server_error", "Gagal mengambil saldo", 500);
    return apiResponse({ saldo: wallet?.saldo ?? 0, updated_at: wallet?.updated_at ?? null });
  } catch {
    return createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

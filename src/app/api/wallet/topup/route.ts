import { z } from "zod";
import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const topupSchema = z.object({
  amount: z
    .number()
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0")
    .max(10_000_000, "Maksimal top up Rp 10.000.000 per transaksi"),
});

// Self-service demo top up - Keluarga dapat menambah saldo sendiri (mode demo)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createApiError("forbidden", "Sesi tidak valid", 401);

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "keluarga") {
      return createApiError("forbidden", "Hanya akun Keluarga yang dapat mengisi saldo", 403);
    }

    const parsed = topupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiResponse(
        { error: "validation_error", message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        422
      );
    }

    const { amount } = parsed.data;

    // Gunakan service role untuk bypass RLS pada demo_wallets
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert wallet jika belum ada
    await admin
      .from("demo_wallets")
      .upsert({ user_id: user.id, saldo: 0 }, { onConflict: "user_id", ignoreDuplicates: true });

    // Ambil wallet lalu update saldo
    const { data: wallet, error: fetchErr } = await admin
      .from("demo_wallets")
      .select("id, saldo")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr || !wallet) {
      return createApiError("server_error", "Gagal mengambil data wallet", 500);
    }

    const newSaldo = Number(wallet.saldo) + amount;

    const { error: updateErr } = await admin
      .from("demo_wallets")
      .update({ saldo: newSaldo, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (updateErr) {
      return createApiError("server_error", "Gagal memperbarui saldo: " + updateErr.message, 500);
    }

    // Catat ke ledger
    await admin.from("demo_wallet_ledger").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount,
      saldo_setelah: newSaldo,
      alasan: "Self top-up demo oleh keluarga",
      created_by: user.id,
    });

    return apiResponse(
      { message: `Saldo demo Rp ${amount.toLocaleString("id-ID")} berhasil ditambahkan`, saldo: newSaldo },
      201
    );
  } catch {
    return createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createApiError("forbidden", "Sesi tidak valid", 401);

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

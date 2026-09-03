import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

// GET /api/wallet — saldo demo wallet milik Keluarga yang sedang login.
// Hanya akun dengan role keluarga yang boleh membaca wallet sendiri.
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login terlebih dahulu", 401);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "keluarga") {
      return createApiError("forbidden", "Hanya akun Keluarga yang memiliki Saldo Demo", 403);
    }

    const { data: wallet, error: walletError } = await supabase
      .from("demo_wallets")
      .select("id, saldo, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (walletError) {
      return createApiError("server_error", walletError.message, 500);
    }

    return apiResponse({
      saldo: Number(wallet?.saldo || 0),
      wallet_id: wallet?.id ?? null,
    }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}
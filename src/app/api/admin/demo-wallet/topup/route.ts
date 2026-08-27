import { z } from "zod";
import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";

const topupSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().int().positive().max(10_000_000),
  alasan: z.string().trim().min(10, "Alasan top up minimal 10 karakter"),
});

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin();
    const parsed = topupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiResponse({ error: "validation_error", message: "Data top up tidak valid", fieldErrors: parsed.error.flatten().fieldErrors }, 422);
    const { data, error } = await supabase.rpc("admin_topup_demo_wallet", {
      target_user_id: parsed.data.user_id,
      topup_amount: parsed.data.amount,
      topup_reason: parsed.data.alasan,
    });
    if (error) return createApiError(error.code === "42501" ? "forbidden" : "conflict", error.message, error.code === "42501" ? 403 : 409);
    if (!data) return createApiError("server_error", "Top up tidak menghasilkan catatan transaksi", 500);
    await writeAuditLog({ actor_id: user.id, action: "admin_demo_wallet_topup", entity_type: "demo_wallet", entity_id: data.id, metadata: { user_id: parsed.data.user_id, amount: parsed.data.amount } });
    return apiResponse({ data, message: "Saldo demo berhasil ditambahkan" }, 201);
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

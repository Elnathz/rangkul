import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import { adminHelperUpdateSchema } from "@/lib/validations/admin-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { alasan?: unknown };
    const reason = typeof body.alasan === "string" ? body.alasan.trim() : "Ditangguhkan oleh Admin";
    const validation = adminHelperUpdateSchema.safeParse({ status: "suspended", suspend_reason: reason });
    if (!validation.success) return createApiError("validation_error", "Alasan penangguhan terlalu singkat", 422);

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("helper_profiles")
      .update({ status: "suspended", suspend_reason: reason, updated_at: new Date().toISOString() })
      .eq("id", id)
      .neq("status", "suspended")
      .select("id, status, suspend_reason, updated_at")
      .maybeSingle();
    if (error) return createApiError("server_error", "Gagal menangguhkan Helper", 500);
    if (!data) return createApiError("conflict", "Helper tidak ditemukan atau sudah ditangguhkan", 409);

    await writeAuditLog({ actor_id: user.id, action: "admin_helper_status_changed", entity_type: "helper_profile", entity_id: id, metadata: { status: "suspended", suspend_reason: reason } });
    return apiResponse({ data, message: "Helper berhasil ditangguhkan" });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { adminHelperUpdateSchema } from "@/lib/validations/admin-helpers";

const helperStatuses = new Set(["pending_verification", "verified", "under_review", "rejected", "suspended"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin();
    const { id } = await params;
    const body = adminHelperUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return apiResponse({ error: "validation_error", message: "Data Helper tidak valid", fieldErrors: body.error.flatten().fieldErrors }, 422);
    const input = body.data;
    if (!input.status && input.assign_fallback !== true) return createApiError("validation_error", "Aksi Helper tidak valid", 422);

    const admin = await createAdminClient();
    const updates: Database["public"]["Tables"]["helper_profiles"]["Update"] = { updated_at: new Date().toISOString() };
    if (input.status) {
      if (!helperStatuses.has(input.status)) return createApiError("validation_error", "Status Helper tidak valid", 422);
      updates.status = input.status as Database["public"]["Enums"]["helper_status"];
      if (input.status === "suspended") {
        updates.suspend_reason = input.suspend_reason?.trim() || "Ditangguhkan oleh Admin";
        updates.verified_by_admin_fallback = false;
      }
    }
    if (input.assign_fallback === true) {
      updates.status = "verified";
      updates.koordinator_id = null;
      updates.verified_by_admin_fallback = true;
      updates.suspend_reason = null;
    }

    const { data, error } = await admin.from("helper_profiles").update(updates).eq("id", id).select("id, status, koordinator_id, verified_by_admin_fallback, suspend_reason, updated_at").maybeSingle();
    if (error) return createApiError("server_error", "Gagal memperbarui Helper", 500);
    if (!data) return createApiError("not_found", "Helper tidak ditemukan", 404);

    await writeAuditLog({ actor_id: user.id, action: input.assign_fallback ? "admin_helper_fallback_assigned" : "admin_helper_status_changed", entity_type: "helper_profile", entity_id: id, metadata: { status: data.status, assign_fallback: input.assign_fallback === true, suspend_reason: data.suspend_reason } });
    return apiResponse({ data, message: "Data Helper berhasil diperbarui" });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

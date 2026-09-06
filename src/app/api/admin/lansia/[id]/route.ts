import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";

const ACTIVE_TASK_STATUSES = [
  "diajukan",
  "menunggu_persetujuan_koordinator",
  "dikonfirmasi",
  "dikerjakan",
  "menunggu_persetujuan_keluarga",
] as const;

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin();
    const { id } = await params;
    const admin = await createAdminClient();

    const { data: profile } = await admin
      .from("lansia_profiles")
      .select("id, nama")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!profile) return createApiError("not_found", "Profil lansia tidak ditemukan", 404);

    const { data: activeTasks, error: taskError } = await admin
      .from("tasks")
      .select("id")
      .eq("lansia_id", id)
      .in("status", [...ACTIVE_TASK_STATUSES])
      .limit(1);

    if (taskError) return createApiError("server_error", "Status kunjungan lansia tidak dapat diperiksa", 500);
    if (activeTasks && activeTasks.length > 0) {
      return createApiError("conflict", "Profil tidak dapat dihapus karena masih memiliki kunjungan aktif", 409);
    }

    const { error: deleteError } = await admin
      .from("lansia_profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (deleteError) return createApiError("server_error", "Gagal menghapus profil lansia", 500);

    await writeAuditLog({
      actor_id: user.id,
      action: "admin_lansia_deleted",
      entity_type: "lansia_profile",
      entity_id: id,
      metadata: { soft_delete: true, nama: profile.nama },
    });

    return apiResponse({ message: "Profil lansia berhasil dihapus" }, 200);
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

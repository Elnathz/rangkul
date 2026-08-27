import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import { updateAdminUserSchema, normalizeIndonesianPhone } from "@/lib/validations/admin-users";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await params;
    if (id === user.id) return createApiError("validation_error", "Akun Admin aktif tidak dapat diubah dari panel ini", 422);
    const validation = updateAdminUserSchema.safeParse(await request.json().catch(() => null));
    if (!validation.success) return apiResponse({ error: "validation_error", message: "Data pengguna tidak valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);

    const { account_status, ...profileInput } = validation.data;
    const profileData = Object.fromEntries(Object.entries(profileInput).filter(([, value]) => value !== undefined));
    let updated = null;

    if (Object.keys(profileData).length > 0) {
      if ("phone" in profileData) profileData.phone = normalizeIndonesianPhone(profileData.phone as string | null);
      const result = await supabase.from("users").update({ ...profileData, updated_at: new Date().toISOString() }).eq("id", id).select("id, email, phone, full_name, username, role, account_status, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, updated_at").single();
      if (result.error) return createApiError("server_error", "Gagal memperbarui profil pengguna", 500);
      updated = result.data;
    }

    if (account_status) {
      const result = await supabase.rpc("admin_set_account_status", { target_user_id: id, next_status: account_status });
      if (result.error) return createApiError("conflict", result.error.message, 409);
      updated = result.data;
    }

    if (!updated) return createApiError("validation_error", "Tidak ada perubahan yang dikirim", 422);
    await writeAuditLog({ actor_id: user.id, action: account_status ? "admin_account_status_changed" : "admin_user_updated", entity_type: "user", entity_id: id, metadata: { account_status: account_status ?? null, fields: Object.keys(profileData) } });
    return apiResponse({ data: updated, message: "Data pengguna berhasil diperbarui" });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin();
    const { id } = await params;
    if (id === user.id) return createApiError("validation_error", "Akun Admin aktif tidak dapat dihapus", 422);

    const admin = await createAdminClient();
    const { data: target } = await admin.from("users").select("id, email, full_name, role").eq("id", id).maybeSingle();
    if (!target) return createApiError("not_found", "Pengguna tidak ditemukan", 404);
    await writeAuditLog({ actor_id: user.id, action: "admin_user_deleted", entity_type: "user", entity_id: id, metadata: { email: target.email, role: target.role } });

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return createApiError("server_error", "Gagal menghapus akun: " + error.message, 500);
    return apiResponse({ message: "Akun pengguna berhasil dihapus" });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

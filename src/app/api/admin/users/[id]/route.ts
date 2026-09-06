import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import { removePrivateObjectsForUser } from "@/lib/storage/private-user-cleanup";
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
    const { supabase, user } = await requireAdmin();
    const { id } = await params;
    if (id === user.id) return createApiError("validation_error", "Akun Admin aktif tidak dapat dihapus", 422);

    const { error: anonymizeError } = await supabase.rpc("admin_anonymize_user", { target_user_id: id });
    if (anonymizeError) {
      const notFound = /tidak ditemukan/i.test(anonymizeError.message);
      return createApiError(notFound ? "not_found" : "conflict", notFound ? "Pengguna tidak ditemukan" : "Akun belum dapat dianonimkan", notFound ? 404 : 409);
    }

    const admin = await createAdminClient();
    await removePrivateObjectsForUser(admin, id);
    const { error } = await admin.auth.admin.deleteUser(id, true);
    if (error) return createApiError("server_error", "Data sudah dianonimkan, tetapi sesi Auth belum dapat ditutup", 500);
    return apiResponse({ message: "Akun dianonimkan dan sesi Auth ditutup" });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

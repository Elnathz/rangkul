import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { adminHelperUpdateSchema } from "@/lib/validations/admin-helpers";
import type { Database } from "@/types/database";

type HelperProfileUpdate = Database["public"]["Tables"]["helper_profiles"]["Update"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = adminHelperUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiResponse({ error: "validation_error", message: "Field profil Helper tidak valid", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

    const admin = await createAdminClient();
    const updatePayload: HelperProfileUpdate = { updated_at: new Date().toISOString() };
    if (parsed.data.bio !== undefined) updatePayload.bio = parsed.data.bio;

    const { data, error } = await admin
      .from("helper_profiles")
      .update(updatePayload)
      .eq("id", id)
      .select("id, bio, updated_at")
      .maybeSingle();
    if (error) return createApiError("server_error", "Profil Helper belum dapat diperbarui", 500);
    if (!data) return createApiError("not_found", "Helper tidak ditemukan", 404);
    return apiResponse({ data: { helper: data } });
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

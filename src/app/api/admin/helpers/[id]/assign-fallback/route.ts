import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { adminFallbackSchema } from "@/lib/validations/admin-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const parsed = adminFallbackSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiResponse({ error: "validation_error", message: "Alasan fallback tidak valid", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

    const { data, error } = await supabase.rpc("assign_admin_fallback", {
      p_helper_id: id,
      p_reason: parsed.data.reason,
    });
    if (error) {
      const status = error.code === "P0002" ? 404 : error.code === "P0001" ? 409 : error.code === "42501" ? 403 : error.code === "22023" ? 422 : 500;
      const code = status === 404 ? "not_found" : status === 409 ? "conflict" : status === 403 ? "forbidden" : status === 422 ? "validation_error" : "server_error";
      const message = status === 409 ? "Fallback ditolak karena Koordinator RT/RW aktif tersedia atau status Helper sudah berubah" : status === 404 ? "Helper tidak ditemukan" : status === 422 ? "Wilayah Helper atau alasan fallback belum valid" : status === 403 ? "Aksi ini hanya untuk Admin" : "Fallback belum dapat ditetapkan";
      return createApiError(code, message, status);
    }
    return apiResponse({ data: { helper: data } });
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

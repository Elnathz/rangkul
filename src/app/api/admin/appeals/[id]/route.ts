import { z } from "zod";
import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";

const reviewSchema = z.object({
  status: z.enum(["disetujui", "ditolak"]),
  alasan: z.string().trim().min(10, "Alasan keputusan minimal 10 karakter"),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiResponse({ error: "validation_error", message: "Keputusan banding tidak valid", fieldErrors: parsed.error.flatten().fieldErrors }, 422);
    const { data, error } = await supabase.rpc("admin_review_appeal", {
      appeal_id: id,
      next_status: parsed.data.status,
      review_reason: parsed.data.alasan,
    });
    if (error) {
      const status = error.code === "P0001" ? 409 : error.code === "42501" ? 403 : 500;
      return createApiError(status === 409 ? "conflict" : status === 403 ? "forbidden" : "server_error", error.message, status);
    }
    return apiResponse({ data, message: "Keputusan banding berhasil disimpan" });
  } catch (error) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

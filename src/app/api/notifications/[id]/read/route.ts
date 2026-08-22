import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengubah notifikasi", 401);
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, is_read")
      .maybeSingle();

    if (error) {
      return createApiError("server_error", "Notifikasi belum dapat diperbarui", 500);
    }

    if (!notification) {
      return createApiError("not_found", "Notifikasi tidak ditemukan", 404);
    }

    return apiResponse({ notification });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Notifikasi belum dapat diperbarui",
      500,
    );
  }
}

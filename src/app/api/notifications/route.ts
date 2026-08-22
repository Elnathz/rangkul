import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk melihat notifikasi", 401);
    }

    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") || 50);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

    const [{ data: notifications, error: notificationsError }, { count: unreadCount, error: unreadError }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, title, body, type, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

    if (notificationsError || unreadError) {
      return createApiError("server_error", "Notifikasi belum dapat dimuat", 500);
    }

    return apiResponse({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
    });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Notifikasi belum dapat dimuat",
      500,
    );
  }
}

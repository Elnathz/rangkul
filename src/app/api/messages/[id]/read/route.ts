import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  void request;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk membaca pesan", 401);
  const { data: message, error } = await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", id).eq("receiver_id", user.id).select().maybeSingle();
  if (error) return createApiError("server_error", error.message, 500);
  if (!message) return createApiError("not_found", "Pesan tidak ditemukan", 404);
  return apiResponse({ message });
}

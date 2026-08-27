import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  void request;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengakui SOS", 401);
  const { data: alert, error } = await supabase.rpc("acknowledge_emergency_alert", {
    p_alert_id: id,
  });
  if (error) {
    const status = error.code === "42501" ? 403 : error.code === "P0002" ? 404 : error.code === "P0001" ? 409 : 422;
    const code = status === 404 ? "not_found" : status === 409 ? "conflict" : status === 403 ? "forbidden" : "invalid_request";
    return createApiError(code, error.message, status);
  }
  return apiResponse({ alert });
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  void request;
  const { id: taskId } = await context.params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk melihat pesan", 401);
  const { data: task, error: taskError } = await supabase.from("tasks").select("id, keluarga_id, helper_id").eq("id", taskId).maybeSingle();
  if (taskError) return createApiError("server_error", taskError.message, 500);
  if (!task || (task.keluarga_id !== user.id && task.helper_id !== user.id)) return createApiError("forbidden", "Anda bukan peserta tugas ini", 403);
  const { data: messages, error } = await supabase.from("messages").select("id, sender_id, receiver_id, task_id, message, created_at, read_at").eq("task_id", taskId).order("created_at", { ascending: true });
  if (error) return createApiError("server_error", error.message, 500);
  return apiResponse({ messages: messages || [] });
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk melihat inbox", 401);
  const { data: messages, error } = await supabase.from("messages").select("id, sender_id, receiver_id, task_id, message, created_at, read_at").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).not("task_id", "is", null).order("created_at", { ascending: false });
  if (error) return createApiError("server_error", error.message, 500);
  const conversations = new Map<string, typeof messages[number]>();
  for (const message of messages || []) {
    const key = `${message.task_id}:${message.sender_id === user.id ? message.receiver_id : message.sender_id}`;
    if (!conversations.has(key)) conversations.set(key, message);
  }
  return apiResponse({ viewer_id: user.id, conversations: [...conversations.values()] });
}

import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/communication";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return createApiError("unauthorized", "Anda harus login untuk mengirim pesan", 401);
  const validation = messageSchema.safeParse(await request.json().catch(() => null));
  if (!validation.success) return apiResponse({ error: "validation_error", message: "Pesan belum valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);

  const { data: task } = await supabase.from("tasks").select("id, keluarga_id, helper_id").eq("id", validation.data.task_id).maybeSingle();
  if (!task) return createApiError("not_found", "Tugas tidak ditemukan", 404);
  let receiverId: string | null = null;
  if (task.keluarga_id === user.id) {
    const { data: helper } = await supabase.from("helper_profiles").select("user_id").eq("id", task.helper_id || "").maybeSingle();
    receiverId = helper?.user_id || null;
  } else {
    const { data: helper } = await supabase.from("helper_profiles").select("user_id").eq("id", task.helper_id || "").maybeSingle();
    if (helper?.user_id === user.id) receiverId = task.keluarga_id;
  }
  if (!receiverId) return createApiError("forbidden", "Anda bukan peserta percakapan tugas ini", 403);

  const { data: message, error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: receiverId, task_id: task.id, message: validation.data.message }).select().single();
  if (error) return createApiError("server_error", error.message, 500);
  return apiResponse({ message }, 201);
}

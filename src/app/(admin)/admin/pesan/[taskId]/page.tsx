import { getChatMessages } from "@/lib/chat/actions";
import { ChatRoomClient } from "@/components/chat/ChatRoomClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const supabaseAdmin = await createAdminClient();

  const { data: task } = await supabaseAdmin
    .from("tasks")
    .select(`id,
      keluarga_id, 
      keluarga:keluarga_id(full_name),
      helper_id,
      helper_profile:helper_profiles!helper_id(user_id)
    `)
    .eq("id", taskId)
    .single();

  if (!task) notFound();

  let otherUserId: string;
  let otherUserName = "Pengguna Rangkul";

  if (user.id === task.keluarga_id) {
    const helperUserId = Array.isArray(task.helper_profile) ? task.helper_profile[0]?.user_id : task.helper_profile?.user_id;
    if (!helperUserId) notFound();
    otherUserId = helperUserId;
    const { data: otherProfile } = await supabaseAdmin.from("users").select("full_name").eq("id", otherUserId).single();
    if (otherProfile) otherUserName = otherProfile.full_name;
  } else {
    otherUserId = task.keluarga_id;
    const { data: otherProfile } = await supabaseAdmin.from("users").select("full_name").eq("id", otherUserId).single();
    if (otherProfile) otherUserName = otherProfile.full_name;
  }

  const messages = await getChatMessages(taskId);

  return (
    <ChatRoomClient
      currentUserId={user.id}
      taskId={taskId}
      otherUser={{
        id: otherUserId,
        name: otherUserName,
        photo: null,
      }}
      initialMessages={messages}
      basePath="/admin/pesan"
    />
  );
}


import { getChatMessages } from "@/lib/chat/actions";
import { ChatRoomClient } from "@/components/chat/ChatRoomClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function KeluargaChatRoomPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const supabaseAdmin = await createAdminClient();

  // Fetch other user profile using admin client to bypass missing table grants
  const { data: otherProfile } = await supabaseAdmin
    .from("users")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (!otherProfile) {
    notFound();
  }

  const messages = await getChatMessages(userId);

  return (
    <ChatRoomClient
      currentUserId={user.id}
      otherUser={{
        id: userId,
        name: otherProfile.full_name,
        photo: null,
      }}
      initialMessages={messages}
      basePath="/beranda/pesan"
    />
  );
}

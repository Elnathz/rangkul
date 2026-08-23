import { getChatMessages } from "@/lib/chat/actions";
import { ChatRoomClient } from "@/components/chat/ChatRoomClient";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function KeluargaChatRoomPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch other user profile
  const { data: otherProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", params.userId)
    .single();

  if (!otherProfile) {
    notFound();
  }

  const messages = await getChatMessages(params.userId);

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-8 md:pt-4">
      <ChatRoomClient
        currentUserId={user.id}
        otherUser={{
          id: params.userId,
          name: otherProfile.full_name,
          photo: null,
        }}
        initialMessages={messages}
        basePath="/beranda/pesan"
      />
    </div>
  );
}

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InboxItem = {
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatParticipant = {
  full_name: string | null;
} | {
  full_name: string | null;
}[] | null;

export type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  sender: ChatParticipant;
  receiver: ChatParticipant;
};

type InboxParticipant = {
  id: string;
  full_name: string | null;
};

type InboxMessageRecord = {
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  sender: InboxParticipant | InboxParticipant[] | null;
  receiver: InboxParticipant | InboxParticipant[] | null;
};

export async function getInbox(): Promise<InboxItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = await createAdminClient();

  // Fetch recent messages where user is sender or receiver
  // Use admin client to bypass missing table grants on public.users
  const { data: messages, error } = await supabaseAdmin
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name),
      receiver:receiver_id (id, full_name)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  const inboxMap = new Map<string, InboxItem>();

  const inboxMessages = (messages ?? []) as unknown as InboxMessageRecord[];

  inboxMessages.forEach((msg) => {
    const isSender = msg.sender_id === user.id;
    // Need to handle if sender/receiver is an array because of foreign keys without one-to-one constraint.
    // Usually it returns an array if foreign key is not strictly one-to-one, or single object if one-to-one.
    const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
    const receiver = Array.isArray(msg.receiver) ? msg.receiver[0] : msg.receiver;

    const otherUser = isSender ? receiver : sender;

    if (!otherUser) return;

    if (!inboxMap.has(otherUser.id)) {
      inboxMap.set(otherUser.id, {
        otherUserId: otherUser.id,
        otherUserName: otherUser.full_name || "Pengguna Rangkul",
        otherUserPhoto: null,
        lastMessage: msg.message,
        lastMessageAt: msg.created_at,
        unreadCount: 0,
      });
    }

    // Increment unread count if we are the receiver and it's not read
    if (!isSender && !msg.read_at) {
      const item = inboxMap.get(otherUser.id)!;
      item.unreadCount++;
    }
  });

  return Array.from(inboxMap.values());
}

export async function getChatMessages(otherUserId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = await createAdminClient();

  // Use admin client to bypass missing table grants on public.users
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select(`
      *,
      sender:sender_id (full_name),
      receiver:receiver_id (full_name)
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ChatMessage[];
}

export async function sendMessage(receiverId: string, message: string, taskId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = await createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      task_id: taskId || null,
      message,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/(keluarga)/beranda/pesan", "layout");
  revalidatePath("/(helper)/helper/pesan", "layout");
  revalidatePath("/(koordinator)/koordinator/pesan", "layout");
  return data;
}

export async function markMessagesAsRead(senderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const supabaseAdmin = await createAdminClient();

  await supabaseAdmin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .is("read_at", null);
}

export async function searchUsersToChat(searchQuery: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const supabaseAdmin = await createAdminClient();

  // Search users by name or role, excluding current user
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, role, kelurahan")
    .neq("id", user.id)
    .ilike("full_name", `%${searchQuery}%`)
    .limit(10);

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }

  return data;
}

export async function getSuggestedUsersToChat() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const supabaseAdmin = await createAdminClient();

  // Get current user's kelurahan
  const { data: currentUser } = await supabaseAdmin
    .from("users")
    .select("kelurahan")
    .eq("id", user.id)
    .single();

  const kelurahan = currentUser?.kelurahan;

  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, role, kelurahan")
    .neq("id", user.id);

  if (kelurahan) {
    query = query.eq("kelurahan", kelurahan);
  }

  const { data, error } = await query.limit(15);

  if (error) {
    console.error("Error getting suggested users:", error);
    return [];
  }

  return data;
}

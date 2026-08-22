"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InboxItem = {
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export async function getInbox(): Promise<InboxItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch recent messages where user is sender or receiver
  const { data: messages, error } = await supabase
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

  messages.forEach((msg: any) => {
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

export async function getChatMessages(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (full_name),
      receiver:receiver_id (full_name)
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessage(receiverId: string, message: string, taskId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
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
  return data;
}

export async function markMessagesAsRead(senderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .is("read_at", null);
}

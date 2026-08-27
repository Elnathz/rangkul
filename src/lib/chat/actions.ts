"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InboxItem = {
  taskId: string;
  taskTitle: string;
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
  task_id: string;
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

type TaskInfo = {
  id: string;
  service_category_id: string;
  keluarga_id: string;
  helper_id: string;
  category?: { nama: string } | { nama: string }[] | null;
};

type InboxMessageRecord = {
  sender_id: string;
  receiver_id: string;
  task_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  sender: InboxParticipant | InboxParticipant[] | null;
  receiver: InboxParticipant | InboxParticipant[] | null;
  task: TaskInfo | TaskInfo[] | null;
};

export async function getInbox(): Promise<InboxItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseClient = await createClient();

  const { data: messages, error } = await supabaseClient
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name),
      receiver:receiver_id (id, full_name),
      task:tasks!inner (
        id, keluarga_id, helper_id,
        category:service_categories (nama)
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .not('task_id', 'is', null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  const inboxMap = new Map<string, InboxItem>();
  const inboxMessages = (messages ?? []) as unknown as InboxMessageRecord[];

  inboxMessages.forEach((msg) => {
    if (!msg.task_id) return;
    
    const isSender = msg.sender_id === user.id;
    const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
    const receiver = Array.isArray(msg.receiver) ? msg.receiver[0] : msg.receiver;
    const otherUser = isSender ? receiver : sender;

    if (!otherUser) return;

    if (!inboxMap.has(msg.task_id)) {
      const task = Array.isArray(msg.task) ? msg.task[0] : msg.task;
      const category = task?.category ? (Array.isArray(task.category) ? task.category[0] : task.category) : null;
      
      inboxMap.set(msg.task_id, {
        taskId: msg.task_id,
        taskTitle: category?.nama || "Tugas Rangkul",
        otherUserId: otherUser.id,
        otherUserName: otherUser.full_name || "Pengguna Rangkul",
        otherUserPhoto: null,
        lastMessage: msg.message,
        lastMessageAt: msg.created_at,
        unreadCount: 0,
      });
    }

    if (!isSender && !msg.read_at) {
      const item = inboxMap.get(msg.task_id)!;
      item.unreadCount++;
    }
  });

  return Array.from(inboxMap.values());
}

export async function getChatMessages(taskId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseClient = await createClient();

  const { data: task, error: taskError } = await supabaseClient
    .from("tasks")
    .select("keluarga_id, helper_id, helper_profile:helper_profiles(user_id)")
    .eq("id", taskId)
    .single();
    
  if (taskError || !task) throw new Error("Tugas tidak ditemukan");
  
  const helperUserId = Array.isArray(task.helper_profile) 
    ? task.helper_profile[0]?.user_id 
    : task.helper_profile?.user_id;
  
  if (task.keluarga_id !== user.id && helperUserId !== user.id) {
    const { data: koordinator } = await supabaseClient
      .from("koordinator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (!koordinator) throw new Error("Anda tidak berhak melihat pesan ini");
  }

  const { data, error } = await supabaseClient
    .from("messages")
    .select(`
      *,
      sender:sender_id (full_name),
      receiver:receiver_id (full_name)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ChatMessage[];
}

export async function sendMessage(taskId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseClient = await createClient();

  const { data: task, error: taskError } = await supabaseClient
    .from("tasks")
    .select("keluarga_id, helper_id, helper_profile:helper_profiles(user_id)")
    .eq("id", taskId)
    .single();

  if (taskError || !task) throw new Error("Tugas tidak ditemukan");

  const helperUserId = Array.isArray(task.helper_profile) 
    ? task.helper_profile[0]?.user_id 
    : task.helper_profile?.user_id;

  if (task.keluarga_id !== user.id && helperUserId !== user.id) {
    throw new Error("Anda bukan partisipan tugas ini");
  }
  
  const receiverId = user.id === task.keluarga_id ? helperUserId : task.keluarga_id;
  if (!receiverId) throw new Error("Tugas ini belum memiliki Helper");

  const { data, error } = await supabaseClient
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      task_id: taskId,
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

export async function markMessagesAsRead(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const supabaseClient = await createClient();

  await supabaseClient
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("task_id", taskId)
    .eq("receiver_id", user.id)
    .is("read_at", null);
}

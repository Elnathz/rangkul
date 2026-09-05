"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/communication";
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
  id: string;
  sender_id: string;
  receiver_id: string;
  task_id: string | null;
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

  const admin = await createAdminClient();

  const { data: messages, error } = await admin
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name),
      receiver:receiver_id (id, full_name),
      task:tasks (
        id, keluarga_id, helper_id,
        category:service_categories (nama)
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  const inboxMap = new Map<string, InboxItem>();
  const inboxMessages = (messages ?? []) as unknown as InboxMessageRecord[];

  inboxMessages.forEach((msg) => {
    const isSender = msg.sender_id === user.id;
    const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
    const receiver = Array.isArray(msg.receiver) ? msg.receiver[0] : msg.receiver;
    const otherUser = isSender ? receiver : sender;

    if (!otherUser) return;

    // Use task_id if present, otherwise group by direct conversation with otherUser.id
    const key = msg.task_id || otherUser.id;

    if (!inboxMap.has(key)) {
      const task = Array.isArray(msg.task) ? msg.task[0] : msg.task;
      const category = task?.category ? (Array.isArray(task.category) ? task.category[0] : task.category) : null;
      
      inboxMap.set(key, {
        taskId: key,
        taskTitle: msg.task_id ? (category?.nama || "Tugas Rangkul") : "Obrolan Langsung",
        otherUserId: otherUser.id,
        otherUserName: otherUser.full_name || "Pengguna Rangkul",
        otherUserPhoto: null,
        lastMessage: msg.message,
        lastMessageAt: msg.created_at,
        unreadCount: 0,
      });
    }

    if (!isSender && !msg.read_at) {
      const item = inboxMap.get(key)!;
      item.unreadCount++;
    }
  });

  return Array.from(inboxMap.values());
}

export async function getChatMessages(taskId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = await createAdminClient();

  // 1. Coba cari apakah taskId merupakan ID tugas yang valid di tabel tasks
  const { data: task } = await admin
    .from("tasks")
    .select("id, keluarga_id, helper_id")
    .eq("id", taskId)
    .maybeSingle();

  let query = admin.from("messages").select(`
    *,
    sender:sender_id (full_name),
    receiver:receiver_id (full_name)
  `);

  if (task) {
    query = query.eq("task_id", taskId);
  } else {
    // taskId adalah ID pengguna (direct user-to-user chat)
    query = query.or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${taskId}),and(sender_id.eq.${taskId},receiver_id.eq.${user.id})`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as ChatMessage[];
}

export async function sendMessage(taskId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validation = messageSchema.safeParse({ task_id: taskId, message });
  if (!validation.success) throw new Error("Pesan belum valid");

  const admin = await createAdminClient();

  // 1. Cek apakah taskId merujuk ke record tasks
  const { data: task } = await admin
    .from("tasks")
    .select("id, keluarga_id, helper_id, helper_profile:helper_profiles(user_id)")
    .eq("id", taskId)
    .maybeSingle();

  let receiverId: string | null = null;
  let targetTaskId: string | null = null;

  if (task) {
    targetTaskId = task.id;
    const helperProfile = Array.isArray(task.helper_profile) ? task.helper_profile[0] : task.helper_profile;
    const helperUserId = helperProfile?.user_id ?? null;

    if (user.id === task.keluarga_id) {
      receiverId = helperUserId;
    } else if (user.id === helperUserId) {
      receiverId = task.keluarga_id;
    } else {
      // Koordinator atau Admin yang mengirim pesan di tugas ini
      receiverId = helperUserId || task.keluarga_id;
    }
  } else {
    // taskId adalah ID penerima langsung (Direct Message)
    receiverId = taskId;
    targetTaskId = null;
  }

  if (!receiverId) throw new Error("Penerima pesan tidak ditemukan.");

  const { data, error } = await admin
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      task_id: targetTaskId,
      message,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Gagal mengirim pesan");

  revalidatePath("/(keluarga)/beranda/pesan", "layout");
  revalidatePath("/(helper)/helper/pesan", "layout");
  revalidatePath("/(koordinator)/koordinator/pesan", "layout");
  revalidatePath("/(admin)/admin/pesan", "layout");
  return data;
}

export async function markMessagesAsRead(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const admin = await createAdminClient();

  await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .or(`task_id.eq.${taskId},sender_id.eq.${taskId}`)
    .eq("receiver_id", user.id)
    .is("read_at", null);
}

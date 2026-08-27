"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Send, ArrowLeft } from "lucide-react";
import { markMessagesAsRead, sendMessage, type ChatMessage } from "@/lib/chat/actions";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ChatRoomClient({
  currentUserId,
  otherUser,
  taskId,
  initialMessages,
  basePath,
}: {
  currentUserId: string;
  otherUser: { id: string; name: string; photo: string | null };
  taskId: string;
  initialMessages: ChatMessage[];
  basePath: string;
}) {
  const router = useRouter();
  const messages = initialMessages;
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`chat-room-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUser.id) ||
            (newMsg.sender_id === otherUser.id && newMsg.receiver_id === currentUserId)
          ) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, currentUserId, otherUser.id, taskId]);

  useEffect(() => {
    const unreadFromOther = messages.some((m) => m.sender_id === otherUser.id && !m.read_at);
    if (unreadFromOther) {
      markMessagesAsRead(taskId).then(() => {
        router.refresh();
      });
    }
  }, [messages, otherUser.id, router, taskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = newMessage;
    setNewMessage("");

    try {
      await sendMessage(taskId, tempMessage);
      router.refresh();
    } catch (error) {
      console.error("Failed to send message", error);
      setNewMessage(tempMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shrink-0 sticky top-0 z-10">
        <Link href={basePath} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="relative shrink-0">
          {otherUser.photo ? (
            <img src={otherUser.photo} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {otherUser.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-900 truncate">{otherUser.name}</h2>
          <p className="text-xs text-slate-500">Percakapan Tugas</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm">Mulai obrolan dengan {otherUser.name}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            const showDate = index === 0 || format(new Date(msg.created_at), "yyyy-MM-dd") !== format(new Date(messages[index - 1].created_at), "yyyy-MM-dd");

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-slate-200/50 text-slate-500 rounded-full text-[10px] font-medium uppercase tracking-wider">
                      {format(new Date(msg.created_at), "dd MMMM yyyy", { locale: localeId })}
                    </span>
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMe
                        ? "bg-[#0D47A1] text-white rounded-br-sm"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(msg.created_at), "HH:mm")}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-bold">
                        {msg.read_at ? <span className="text-blue-500">✓✓</span> : <span className="text-slate-300">✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-white p-3 border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 bg-[#0D47A1] text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

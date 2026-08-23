"use client";

import { useEffect, useState } from "react";
import { CheckCheck, Loader2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type Conversation = { id: string; sender_id: string; receiver_id: string; task_id: string | null; message: string; created_at: string; read_at: string | null };
type Message = Conversation;

interface InboxUIProps { role: "helper" | "keluarga"; }

export default function InboxUI({ role }: InboxUIProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    const response = await fetch("/api/messages/conversations", { cache: "no-store" });
    const body = await response.json().catch(() => null) as { viewer_id?: string; conversations?: Conversation[]; message?: string } | null;
    if (!response.ok) throw new Error(body?.message || "Inbox tidak dapat dimuat");
    const next = body?.conversations || [];
    setViewerId(body?.viewer_id || null);
    setConversations(next);
    setSelected((current) => current && next.some((item) => item.id === current.id) ? current : next[0] || null);
  };

  const loadMessages = async (conversation: Conversation | null) => {
    if (!conversation?.task_id) { setMessages([]); return; }
    const response = await fetch(`/api/messages/${conversation.task_id}`, { cache: "no-store" });
    const body = await response.json().catch(() => null) as { messages?: Message[]; message?: string } | null;
    if (!response.ok) throw new Error(body?.message || "Percakapan tidak dapat dimuat");
    setMessages(body?.messages || []);
  };

  useEffect(() => {
    // This effect synchronizes the inbox view with the authenticated API response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversations().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Inbox tidak dapat dimuat")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // This effect reloads the selected task conversation after the selection changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages(selected).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Pesan tidak dapat dimuat"));
  }, [selected]);

  const sendMessage = async () => {
    if (!draft.trim() || !selected?.task_id) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_id: selected.task_id, message: draft }) });
      const body = await response.json().catch(() => null) as { message?: Message; errorMessage?: string } | null;
      if (!response.ok || !body?.message || typeof body.message === "string") throw new Error(body?.errorMessage || "Pesan gagal dikirim");
      setDraft("");
      await loadMessages(selected);
      await loadConversations();
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Pesan gagal dikirim"); }
    finally { setSending(false); }
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500"><Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />Memuat percakapan...</div>;

  return <div className="mx-auto max-w-6xl px-4 py-8"><div className="mb-8"><h1 className="text-3xl font-black tracking-tight text-slate-900">Pesan</h1><p className="mt-1 font-medium text-slate-500">Percakapan yang terkait dengan tugas nyata Anda sebagai {role === "helper" ? "Helper" : "Keluarga"}.</p></div>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex h-[600px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"><aside className="w-full border-r border-slate-100 bg-slate-50/50 md:w-1/3"><div className="border-b border-slate-100 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input aria-label="Cari pesan" placeholder="Cari percakapan..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#0D47A1]" /></div></div><div className="overflow-y-auto">{conversations.length === 0 ? <p className="p-6 text-sm text-slate-500">Belum ada percakapan dari tugas Anda.</p> : conversations.map((conversation) => <button key={conversation.id} onClick={() => setSelected(conversation)} className={`w-full border-l-4 p-4 text-left transition ${selected?.id === conversation.id ? "border-[#0D47A1] bg-blue-50/60" : "border-transparent hover:bg-slate-100"}`}><p className="font-bold text-slate-900">Tugas {conversation.task_id?.slice(0, 8) || "umum"}</p><p className="mt-1 truncate text-sm text-slate-500">{conversation.message}</p><p className="mt-1 text-xs text-slate-400">{new Date(conversation.created_at).toLocaleString("id-ID")}</p></button>)}</div></aside><section className="hidden w-2/3 flex-col md:flex">{selected ? <><header className="border-b border-slate-100 p-4"><p className="font-bold text-slate-900">Percakapan tugas {selected.task_id?.slice(0, 8)}</p><p className="text-xs text-slate-500">Pesan hanya terlihat oleh peserta tugas.</p></header><div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">{messages.map((message) => { const isMine = message.sender_id === viewerId; return <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${isMine ? "bg-[#0D47A1] text-white" : "border border-slate-100 bg-white text-slate-800"}`}><p>{message.message}</p><span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">{new Date(message.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}{isMine && <CheckCheck className="h-3 w-3" />}</span></div></div>; })}</div><div className="border-t border-slate-100 p-4"><div className="flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder="Ketik pesan..." className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0D47A1]" /><Button onClick={() => void sendMessage()} disabled={sending || !draft.trim()} className="rounded-full bg-[#0D47A1]">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button></div></div></> : <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Pilih percakapan dari tugas Anda.</div>}</section></div></div>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { usePathname } from "next/navigation";
import { Search, Plus, Users } from "lucide-react";
import Image from "next/image";

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

import { useRouter } from "next/navigation";
import { AdminModal } from "@/components/admin/AdminPrimitives";
import { Loader2 } from "lucide-react";

type ChatTarget = {
  id: string;
  user_id: string;
  nama: string;
  role: "helper" | "keluarga";
  foto_url: string | null;
  info: string;
};

export function InboxList({ inbox, basePath }: { inbox: InboxItem[], basePath: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"helper" | "keluarga">("helper");
  const [helpers, setHelpers] = useState<ChatTarget[]>([]);
  const [keluarga, setKeluarga] = useState<ChatTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const openStartChatModal = async () => {
    setModalOpen(true);
    setLoadingTargets(true);
    try {
      const res = await fetch("/api/chat/start-target", { cache: "no-store" });
      const payload = await res.json();
      if (res.ok) {
        setHelpers(payload.helpers ?? []);
        setKeluarga(payload.keluarga ?? []);
      }
    } catch {
      // fallback
    } finally {
      setLoadingTargets(false);
    }
  };

  const handleSelectTarget = async (target: ChatTarget) => {
    setStartingChat(target.id);
    try {
      const res = await fetch("/api/chat/start-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: target.user_id, role: target.role }),
      });
      const payload = await res.json();
      if (res.ok && payload.taskId) {
        setModalOpen(false);
        router.push(`${basePath}/${payload.taskId}`);
      } else {
        alert(payload.message || "Gagal membuka obrolan");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setStartingChat(null);
    }
  };

  const filteredInbox = inbox.filter(item => 
    item.otherUserName.toLowerCase().includes(search.toLowerCase()) || 
    item.taskTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Pesan Utama</h2>
        {basePath.includes("koordinator") && (
          <button
            type="button"
            onClick={openStartChatModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Mulai Obrolan</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-200 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            placeholder="Cari pesan atau tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] h-full text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D47A1] flex items-center justify-center mb-3 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Belum ada obrolan aktif</p>
            <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">
              Obrolan tugas otomatis muncul saat Helper atau Keluarga berkomunikasi dengan Anda. Anda juga dapat melihat daftar Helper wilayah.
            </p>
            {basePath.includes("koordinator") && (
              <Link
                href="/koordinator/helper"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 active:scale-95 transition-all"
              >
                <Users className="h-4 w-4" />
                <span>Lihat Helper Wilayah</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInbox.map((item) => {
              const initials = item.otherUserName.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
              const isActive = pathname.includes(`${basePath}/${item.taskId}`);

              return (
                <Link
                  key={item.taskId}
                  href={`${basePath}/${item.taskId}`}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isActive ? "bg-blue-50" : "hover:bg-slate-50 bg-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.otherUserPhoto ? (
                      <Image
                        src={item.otherUserPhoto}
                        alt={item.otherUserName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
                        {initials}
                      </div>
                    )}
                    {item.unreadCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                        {item.otherUserName}
                      </h3>
                      <span className={`text-[11px] shrink-0 ${item.unreadCount > 0 ? "text-green-600 font-medium" : "text-slate-400"}`}>
                        {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#0D47A1] font-semibold truncate mb-1">
                      {item.taskTitle}
                    </p>
                    <p className={`text-sm truncate ${item.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                      {item.lastMessage}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen ? (
        <AdminModal
          title="Mulai Obrolan Baru"
          description="Pilih akun Helper atau Keluarga di wilayah Anda untuk membuka percakapan langsung."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("helper")}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "helper" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Daftar Helper ({helpers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("keluarga")}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "keluarga" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Daftar Keluarga ({keluarga.length})
              </button>
            </div>

            {loadingTargets ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {(activeTab === "helper" ? helpers : keluarga).length === 0 ? (
                  <p className="py-8 text-center text-xs font-semibold text-slate-500">
                    Tidak ada akun {activeTab} ditemukan di wilayah Anda.
                  </p>
                ) : (
                  (activeTab === "helper" ? helpers : keluarga).map((target) => (
                    <div
                      key={target.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-full bg-blue-50 border border-slate-200 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
                          {target.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{target.nama}</p>
                          <p className="text-xs text-slate-500 truncate">{target.info}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={startingChat === target.id}
                        onClick={() => handleSelectTarget(target)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 active:scale-95 transition-all shrink-0"
                      >
                        {startingChat === target.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Obrolkan"
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

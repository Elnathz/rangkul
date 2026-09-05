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

export function InboxList({ inbox, basePath }: { inbox: InboxItem[], basePath: string }) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filteredInbox = inbox.filter(item => 
    item.otherUserName.toLowerCase().includes(search.toLowerCase()) || 
    item.taskTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Pesan Tugas</h2>
        {basePath.includes("koordinator") && (
          <Link
            href="/koordinator/helper"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Mulai Obrolan</span>
          </Link>
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

    </div>
  );
}

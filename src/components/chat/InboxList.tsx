"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { InboxItem } from "@/lib/chat/actions";

export function InboxList({ inbox, basePath }: { inbox: InboxItem[], basePath: string }) {
  if (inbox.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum Ada Pesan</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Pesan dari percakapan tugas Anda akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {inbox.map((item) => {
        const initials = item.otherUserName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

        return (
          <Link
            key={item.otherUserId}
            href={`${basePath}/${item.otherUserId}`}
            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors bg-white"
          >
            <div className="relative shrink-0">
              {item.otherUserPhoto ? (
                <img
                  src={item.otherUserPhoto}
                  alt={item.otherUserName}
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
                <h3 className="text-sm font-semibold text-slate-900 truncate pr-4">
                  {item.otherUserName}
                </h3>
                <span className="text-xs text-slate-400 shrink-0">
                  {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true, locale: id })}
                </span>
              </div>
              <p className={`text-sm truncate ${item.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                {item.lastMessage}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

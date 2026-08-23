"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, X, Users, MapPin } from "lucide-react";
import Image from "next/image";
import { searchUsersToChat, getSuggestedUsersToChat, type InboxItem } from "@/lib/chat/actions";

export function InboxList({ inbox, basePath }: { inbox: InboxItem[], basePath: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; role: string; kelurahan: string | null }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);

  // Fetch suggested users when modal opens
  const openModal = async () => {
    setIsModalOpen(true);
    if (searchResults.length === 0 && !userSearchQuery) {
      setIsSearching(true);
      try {
        const suggested = await getSuggestedUsersToChat();
        setSearchResults(suggested as { id: string; full_name: string; role: string; kelurahan: string | null }[]);
        setIsSuggested(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const filteredInbox = inbox.filter(item => 
    item.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;
    
    setIsSearching(true);
    setIsSuggested(false);
    try {
      const results = await searchUsersToChat(userSearchQuery);
      setSearchResults(results as { id: string; full_name: string; role: string; kelurahan: string | null }[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewChat = (userId: string) => {
    setIsModalOpen(false);
    router.push(`${basePath}/${userId}`);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h2 className="text-xl font-bold text-slate-800">Pesan</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={openModal}
            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
            title="Mulai Pesan Baru"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
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
            placeholder="Cari pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
            <p className="text-sm mb-4">Belum ada obrolan.</p>
            <button 
              onClick={openModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Mulai Pesan Baru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInbox.map((item) => {
              const initials = item.otherUserName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
              const isActive = pathname.includes(`${basePath}/${item.otherUserId}`);

              return (
                <Link
                  key={item.otherUserId}
                  href={`${basePath}/${item.otherUserId}`}
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

      {/* New Chat Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
            <button onClick={() => setIsModalOpen(false)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Pesan Baru</h2>
          </div>
          
          <div className="p-4 border-b border-slate-200">
            <form onSubmit={handleSearchUsers} className="flex gap-2">
              <input 
                type="text" 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari nama pengguna..." 
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                disabled={!userSearchQuery.trim() || isSearching}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? "Mencari..." : "Cari"}
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isSearching && searchResults.length === 0 ? (
               <div className="flex justify-center p-8">
                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-slate-500 mt-8 text-sm flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p>Ketik nama untuk mencari pengguna</p>
              </div>
            ) : (
              <div className="space-y-1">
                {isSuggested && (
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Rekomendasi di Kelurahan Anda
                  </div>
                )}
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startNewChat(u.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {u.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{u.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize bg-slate-100 px-2 py-0.5 rounded-full">{u.role}</span>
                        {u.kelurahan && <span className="truncate flex items-center gap-1"><MapPin className="w-3 h-3"/> {u.kelurahan}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

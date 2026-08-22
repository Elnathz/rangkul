import { Search, Send, Image as ImageIcon, PhoneCall, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InboxUIProps {
  role: "helper" | "keluarga";
}

export default function InboxUI({ role }: InboxUIProps) {
  const isHelper = role === "helper";

  const contacts = [
    {
      id: 1,
      name: isHelper ? "Budi Santoso (Keluarga)" : "Siti Aminah (Helper)",
      task: "Pendampingan RS - 24 Ags",
      lastMessage: isHelper ? "Baik, saya akan datang tepat waktu ya bu." : "Apakah surat rujukan sudah dibawa?",
      time: "10:42",
      unread: 2,
      active: true,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${isHelper ? "Budi" : "Siti"}&backgroundColor=b6e3f4`
    },
    {
      id: 2,
      name: isHelper ? "Rina Wijaya (Keluarga)" : "Bambang (Helper)",
      task: "Cek Kesehatan Rutin - Selesai",
      lastMessage: "Terima kasih banyak atas bantuannya hari ini.",
      time: "Kemarin",
      unread: 0,
      active: false,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${isHelper ? "Rina" : "Bambang"}&backgroundColor=c0aede`
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Pesan</h1>
          <p className="text-gray-500 mt-1 font-medium">Komunikasi terkait tugas aktif Anda</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex h-[600px] relative">
        {/* Sidebar / Contacts List */}
        <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari pesan atau nama..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0D47A1] focus:ring-1 focus:ring-[#0D47A1] transition-shadow"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${contact.active ? 'bg-blue-50/50 border-l-4 border-[#0D47A1]' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full border border-gray-200 bg-white" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 truncate pr-2">{contact.name}</h3>
                    <span className={`text-xs font-medium whitespace-nowrap ${contact.unread > 0 ? 'text-[#0D47A1]' : 'text-gray-400'}`}>{contact.time}</span>
                  </div>
                  <p className="text-xs text-[#0D47A1] font-semibold truncate mt-0.5">{contact.task}</p>
                  <p className={`text-sm truncate mt-0.5 ${contact.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#0D47A1] text-white text-xs flex items-center justify-center font-bold shrink-0 mt-6">
                    {contact.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile if not selected, but for this demo we'll just show it or hide the sidebar based on screen size using CSS */}
        <div className="hidden md:flex flex-col w-2/3 bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={contacts[0].avatar} alt={contacts[0].name} className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50" />
              <div>
                <h2 className="font-bold text-gray-900">{contacts[0].name}</h2>
                <p className="text-xs text-gray-500 font-medium">Tugas: {contacts[0].task}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full border-gray-200 text-[#0D47A1]">
                <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
            <div className="text-center">
              <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-400 px-3 py-1 rounded-full shadow-sm">Hari Ini</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2 max-w-[80%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={contacts[0].avatar} alt="Avatar" className="w-6 h-6 rounded-full mb-1" />
                <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-bl-sm shadow-sm">
                  <p className="text-sm text-gray-800">Halo, jangan lupa besok jadwalnya jam 09:00 pagi ya.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">10:40</span>
                </div>
              </div>

              <div className="flex items-end justify-end gap-2 max-w-[80%] self-end">
                <div className="bg-[#0D47A1] p-3.5 rounded-2xl rounded-br-sm shadow-md shadow-blue-900/10 text-white">
                  <p className="text-sm">{contacts[0].lastMessage}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-blue-200">10:42</span>
                    <CheckCheck className="w-3 h-3 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-[#0D47A1] transition-colors rounded-full hover:bg-blue-50">
                <ImageIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Ketik pesan..." 
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0D47A1] focus:ring-1 focus:ring-[#0D47A1] transition-all"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0D47A1] text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors shadow-sm">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

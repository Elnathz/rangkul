import { getInbox } from "@/lib/chat/actions";
import { InboxList } from "@/components/chat/InboxList";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KeluargaPesanPage() {
  const inbox = await getInbox();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#0D47A1] text-white rounded-xl shadow-sm">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kotak Masuk</h1>
          <p className="text-slate-500">Percakapan Anda dengan Helper</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <InboxList inbox={inbox} basePath="/beranda/pesan" />
      </div>
    </div>
  );
}
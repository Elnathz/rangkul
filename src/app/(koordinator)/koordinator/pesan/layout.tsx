import { getInbox } from "@/lib/chat/actions";
import { InboxList } from "@/components/chat/InboxList";
import { ChatLayoutWrapper } from "@/components/chat/ChatLayoutWrapper";

export const dynamic = "force-dynamic";

export default async function KoordinatorPesanLayout({ children }: { children: React.ReactNode }) {
  const inbox = await getInbox();

  return (
    <div className="bg-[#f0f2f5] min-h-[calc(100vh-4rem)]">
      <div className="py-0 md:py-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
        <ChatLayoutWrapper 
          inboxList={<InboxList inbox={inbox} basePath="/koordinator/pesan" />} 
          chatRoom={children} 
        />
      </div>
    </div>
  );
}

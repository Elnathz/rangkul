"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function ChatLayoutWrapper({
  inboxList,
  chatRoom,
}: {
  inboxList: React.ReactNode;
  chatRoom: React.ReactNode;
}) {
  const pathname = usePathname();
  // Determies if a chat room is active if there is a userId param (pathname has more than 3 parts e.g. /role/pesan/user-id)
  const isChatActive = pathname.split("/").filter(Boolean).length > 2;

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-white shadow-sm overflow-hidden border-x border-slate-200">
      {/* Sidebar - Hidden on mobile if chat is active */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white ${
          isChatActive ? "hidden md:flex" : "flex"
        }`}
      >
        {inboxList}
      </div>

      {/* Main Chat Area - Hidden on mobile if no chat is active */}
      <div
        className={`flex-1 flex flex-col bg-[#efeae2] relative ${
          !isChatActive ? "hidden md:flex" : "flex"
        }`}
      >
        {chatRoom}
      </div>
    </div>
  );
}

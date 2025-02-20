"use client";

import { MessageInput } from "@/components/conversations/message-input";
import dynamic from "next/dynamic";

const MessageHistoryList = dynamic(
  () => import("../components/conversations/message-history-list"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative flex flex-col flex-1 bg-base-200/80 min-h-0 isolate">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 space-y-4 mb-4">
          <MessageHistoryList />
        </div>
      </div>
      <div className="flex-shrink-0 relative z-10">
        <MessageInput />
      </div>
    </div>
  );
}

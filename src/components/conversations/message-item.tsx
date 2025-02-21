import { cn } from "@/lib/utils";
import { ChatMessage } from "@/services/repositories/objects/conversation-repository";
import { useChatStore } from "@/store/use-chat-store";
import { MessageActions } from "./message-actions";

interface MessageItemProps {
  message: ChatMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  console.log("rendering message item", message.id, message.role);
  const { regenerateMessage } = useChatStore();

  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={cn(
          "relative max-w-[80%] p-2 rounded-lg",
          isUser
            ? "bg-primary text-primary-content ml-2"
            : "bg-base-200 text-base-content mr-2"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className="mt-2">
        <MessageActions message={message} onRegenerate={regenerateMessage} />
        </div>
      </div>
    </div>
  );
}

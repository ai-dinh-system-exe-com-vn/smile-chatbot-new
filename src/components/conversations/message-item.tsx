import { cn } from "@/lib/utils";
import { ChatMessage } from "@/services/repositories/objects/conversations";
import { useChatStore } from "@/store/use-chat-store";
import { MessageActions } from "./message-actions";

interface MessageItemProps {
  message: ChatMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  console.log("rendering message item", message.id, message.role);
  const { regenerateMessage, messageMainStream } = useChatStore();
  if (message.role == "loading" && messageMainStream.trim() !== "") {
    return (
      <div className={`flex justify-start mb-4`}>
        <div
          className={cn(
            "relative max-w-[80%] p-4 rounded-lg",

            "bg-base-200 text-base-content mr-4"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {messageMainStream}
          </p>
        </div>
      </div>
    );
  } else {
    const isUser = message.role === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={cn(
            "relative max-w-[80%] p-4 rounded-lg",
            isUser
              ? "bg-primary text-primary-content ml-4"
              : "bg-base-200 text-base-content mr-4"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <MessageActions message={message} onRegenerate={regenerateMessage} />
        </div>
      </div>
    );
  }
}

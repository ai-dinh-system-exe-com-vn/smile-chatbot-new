import { ChatMessage } from "@/services/repositories/objects/conversation-repository";
import { useChatStore } from "@/store/use-chat-store";
import MessageItem from "./message-item";

export default function MessageHistoryList() {
  const { messages } = useChatStore();
  console.log("rendering message history list", messages);

  return messages.map((message: ChatMessage) => (
    <MessageItem key={message.id} message={message} />
  ));
}

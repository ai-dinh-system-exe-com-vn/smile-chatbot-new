import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";

export default function MessageItemStream() {
  const { messageMainStream } = useChatStore();
  console.log("rendering message item stream", messageMainStream);
  if (messageMainStream.trim() === "") {
    return <></>;
  }

  return (
    <div className={`flex justify-start mb-4`}>
      <div
        className={cn(
          "relative max-w-[80%] p-4 rounded-lg",
          "bg-base-200 text-base-content mr-4"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">sdsadasđá</p>
      </div>
    </div>
  );
}

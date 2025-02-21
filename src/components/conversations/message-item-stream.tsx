import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";

export default function MessageItemStream() {
  const { isLoading, messageMainStream } = useChatStore();
  console.log("rendering message item stream", messageMainStream);

  if (isLoading || messageMainStream !== "") {
    return (
      <div className={`flex justify-start mb-4`}>
        <div
          className={cn(
            "relative max-w-[80%] p-4 rounded-lg",
            "bg-base-200 text-base-content mr-4"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{messageMainStream || "Request api ..."}</p>
        </div>
      </div>
    );
  }
}

import { cn } from "@/lib/utils";
import { ChatMessage } from "@/services/repositories/objects/conversation-repository";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BsArrowClockwise, BsCheckLg, BsClipboard } from "react-icons/bs";

interface MessageActionsProps {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
}

export const MessageActions = ({
  message,
  onRegenerate,
}: MessageActionsProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const { role, id: messageId, content, timestamp } = message;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  if (role === "system") return null;

  return (
    <motion.div
      className="flex justify-between items-center mt-2 text-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0.5 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex gap-2">
        <motion.button
          className={cn(
            "btn btn-ghost btn-xs gap-1.5 rounded-lg",
            copied
              ? "text-success hover:bg-success/10"
              : role === "assistant"
              ? "text-base-content hover:bg-base-200"
              : "text-primary-content hover:bg-primary/10"
          )}
          onClick={copyToClipboard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label={copied ? "Copied!" : "Copy response"}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-1.5"
              >
                <BsCheckLg className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-1.5"
              >
                <BsClipboard className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Copy</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {onRegenerate && role != "user" && messageId && (
          <motion.button
            className={cn(
              "btn btn-ghost btn-xs gap-1.5 rounded-lg",
              role === "assistant"
                ? "text-base-content hover:bg-base-200"
                : "text-primary-content hover:bg-primary/10"
            )}
            onClick={() => onRegenerate(messageId)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.2,
            }}
          >
            <motion.span
              className="flex items-center gap-1.5"
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ x: 2 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: 0.1,
              }}
            >
              <BsArrowClockwise className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Regenerate</span>
            </motion.span>
          </motion.button>
        )}
      </div>

      {timestamp && (
        <motion.time
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-md transition-colors",
            role === "assistant"
              ? "text-base-content"
              : "text-primary-content"
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formatTimestamp(timestamp)}
        </motion.time>
      )}
    </motion.div>
  );
};

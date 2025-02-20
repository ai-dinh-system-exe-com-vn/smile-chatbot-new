"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BsGearFill, BsSendFill, BsSendX } from "react-icons/bs";
import { PiLightbulb } from "react-icons/pi";

export const MessageInput = () => {
  const [localInput, setLocalInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isLoading,
    isRegenerating,
    isThinkModeEnabled,
    submitMessage,
    toggleThinkMode,
  } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + "px";
    }
  }, [localInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = localInput.trim();
    if (!trimmedInput || isLoading || isRegenerating) return;

    submitMessage(trimmedInput);
    setLocalInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="px-4 py-3"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 w-full mx-auto max-w-[95%] xl:max-w-[85%] 2xl:max-w-[75%] border border-base-300 rounded-2xl p-3 bg-base-100"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full">
          <motion.div
            initial={false}
            animate={{
              opacity: isLoading ? 0.7 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={localInput}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading || isRegenerating}
              className={cn(
                "textarea w-full resize-none min-h-[48px] max-h-[150px] bg-transparent",
                "focus:outline-none border-0 focus:border-0",
                "placeholder:text-base-content/50",
                isLoading || (isRegenerating && "opacity-50")
              )}
            />
          </motion.div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => {
                console.log("Show settings");
              }}
              className="flex items-center justify-center h-10 w-10 transition-colors duration-200"
              title="Settings"
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <BsGearFill className="h-5 w-5 text-primary hover:text-primary-focus transition-colors duration-200" />
            </motion.button>

            <motion.button
              type="button"
              onClick={toggleThinkMode}
              className={`flex items-center justify-center h-10 w-10 transition-all duration-300 ease-out rounded-2xl
                  ${
                    isThinkModeEnabled
                      ? "bg-primary text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                      : "hover:bg-base-200"
                  }`}
              title="Toggle Think Mode"
              whileHover={{ y: -2, scale: 1.05 }}
              animate={
                isThinkModeEnabled
                  ? {
                      scale: [1, 1.05, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
                  : {}
              }
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <PiLightbulb
                className={`h-5 w-5 ${
                  isThinkModeEnabled
                    ? "text-white"
                    : "text-primary hover:text-primary-focus"
                } transition-colors duration-200`}
              />
            </motion.button>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !localInput.trim() || isRegenerating}
            className={`flex bg-primary text-white items-center justify-center h-10 w-10 transition-all duration-300 ease-out rounded-2xl
              ${
                !localInput.trim()
                  ? "cursor-not-allowed"
                  : isLoading || isRegenerating
                  ? "shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                  : "shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              }`}
            whileHover={
              localInput.trim() && !isLoading && !isRegenerating
                ? { y: -2, scale: 1.05 }
                : {}
            }
            whileTap={
              localInput.trim() && !isLoading && !isRegenerating
                ? { scale: 0.95 }
                : {}
            }
            animate={
              isLoading || isRegenerating
                ? {
                    scale: [1, 1.05, 1],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
                : {}
            }
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <AnimatePresence mode="wait">
              {isLoading || isRegenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-[3px] px-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white animate-pulse"
                      animate={{ y: ["0%", "-50%", "0%"] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {localInput.trim() ? (
                    <motion.div
                      key="send-fill"
                      initial={{ y: 10, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -10, opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "tween",
                        duration: 0.15,
                        ease: "easeOut",
                      }}
                    >
                      <BsSendFill
                        className={cn("h-5 w-5 transition-colors duration-200")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send-x"
                      initial={{ y: -10, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 10, opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "tween",
                        duration: 0.15,
                        ease: "easeOut",
                      }}
                    >
                      <BsSendX
                        className={cn("h-5 w-5 transition-colors duration-200")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

import { completeSteam } from "@/services/chat-service";
import { ChatMessage } from "@/services/repositories/objects/conversation-repository";
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { create } from "zustand";
import { useGlobalStore } from "./global-store";

type AddMessageOptions = {
  removeIndex?: number; // index của message cần loại bỏ, nếu có
  removeLast?: boolean; // nếu true, loại bỏ phần tử cuối cùng
};

interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isRegenerating: boolean;
  isThinkModeEnabled: boolean;
  messageMainStream: string;
  setConversationId: (id: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setMessageMainStream: (content: string) => void;
  addMessage: (message: ChatMessage, options?: AddMessageOptions) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRegenerating: (isRegenerating: boolean) => void;
  toggleThinkMode: () => void;
  handlerSubmitUserMessage: (content: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get, api) => {
  api.subscribe((state, prevState) => {
    if (state.conversationId !== prevState.conversationId) {

      console.log("setConversationId", state.conversationId);
    }
    // console.log("ChatStore", state, prevState);
  });

  return {
    messages: [],
    isLoading: false,
    isRegenerating: false,
    isThinkModeEnabled: false,
    messageMainStream: "",
    conversationId: "",

    setConversationId: (id: string) => set({ conversationId: id }),
    setMessageMainStream: (content) => set({ messageMainStream: content }),

    setMessages: (messages) => set({ messages }),

    addMessage: (message: ChatMessage, options?: AddMessageOptions) =>
      set((state) => {
        const messages = [...state.messages];

        if (
          options?.removeIndex !== undefined &&
          options.removeIndex >= 0 &&
          options.removeIndex < messages.length
        ) {
          messages.splice(options.removeIndex, 1);
        } else if (options?.removeLast) {
          if (messages.length > 0) {
            messages.pop();
          }
        }

        messages.push(message);

        return { messages };
      }),

    updateMessage: (messageId, updates) =>
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      })),

    setIsLoading: (isLoading) => set({ isLoading }),

    setIsRegenerating: (isRegenerating) => set({ isRegenerating }),

    toggleThinkMode: () =>
      set((state) => ({
        isThinkModeEnabled: !state.isThinkModeEnabled,
      })),

    handlerSubmitUserMessage: async (content: string) => {
      const { addMessage, setIsLoading, messages } = get();
      const globalApiKey = useGlobalStore.getState().globalApiKey;
      let messageSend: ChatMessage[] = [...messages];

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      messageSend.push(newMessage);

      addMessage(newMessage);
      setIsLoading(true);

      const completion = await completeSteam({
        messageSend: messageSend.map((item) => {
          return {
            role: item.role,
            content: item.content,
          } as ChatCompletionSystemMessageParam;
        }),
        onStream: (message) => {
          set({ messageMainStream: message });
        },
        config: {
          provider: "openai",
          apiKey: globalApiKey,
        },
      });

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: completion,
        timestamp: Date.now(),
      };
      set({ messageMainStream: "" });
      addMessage(botResponse);
      setIsLoading(false);
    },

    regenerateMessage: async (messageId: string) => {
      const { setIsRegenerating, updateMessage } = get();

      setIsRegenerating(true);

      // Simulate regeneration
      return new Promise((resolve) => {
        setTimeout(() => {
          updateMessage(messageId, {
            content:
              "This is a regenerated response. In a real application, this would be from an API call.",
            timestamp: Date.now(),
          });
          setIsRegenerating(false);
          resolve();
        }, 2000);
      });
    },
  };
});

import { constructLlmApi } from "@/services/api/providers/constructLlmApi";
import { ChatMessage } from "@/services/repositories/objects/conversations";
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { create } from "zustand";

type AddMessageOptions = {
  removeIndex?: number; // index của message cần loại bỏ, nếu có
  removeLast?: boolean; // nếu true, loại bỏ phần tử cuối cùng
};
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isRegenerating: boolean;
  isThinkModeEnabled: boolean;
  messageMainStream: string;
  setMessages: (messages: ChatMessage[]) => void;
  setMessageMainStream: (content: string) => void;
  addMessage: (message: ChatMessage, options?: AddMessageOptions) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRegenerating: (isRegenerating: boolean) => void;
  toggleThinkMode: () => void;
  submitMessage: (content: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: "1",
      role: "user",
      content: "Hello! How are you?",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Hi! I'm doing great, thank you for asking. How can I help you today?",
      timestamp: Date.now() - 3500000,
    },
    {
      id: "3",
      role: "user",
      content: "Can you help me with my project?",
      timestamp: Date.now() - 3300000,
    },
    {
      id: "4",
      role: "assistant",
      content:
        "Of course! I'd be happy to help you with your project. Please tell me more about what you need assistance with.",
      timestamp: Date.now() - 3200000,
    },
  ],
  isLoading: false,
  isRegenerating: false,
  isThinkModeEnabled: false,

  messageMainStream: "",
  setMessageMainStream: (content) => set({ messageMainStream: content }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message: ChatMessage, options?: AddMessageOptions) =>
    set((state) => {
      // Tạo bản sao messages để thao tác
      const messages = [...state.messages];

      // Nếu có chỉ định removeIndex và index hợp lệ thì loại bỏ message ở vị trí đó
      if (
        options?.removeIndex !== undefined &&
        options.removeIndex >= 0 &&
        options.removeIndex < messages.length
      ) {
        messages.splice(options.removeIndex, 1);
      }
      // Nếu không có removeIndex mà lại chỉ định removeLast
      else if (options?.removeLast) {
        // Nếu mảng messages không rỗng, loại bỏ phần tử cuối cùng
        if (messages.length > 0) {
          messages.pop();
        }
      }

      // Thêm message mới vào cuối mảng
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

  submitMessage: async (content: string) => {
    const { addMessage, setIsLoading, messages } = get();
    let messageSend: ChatMessage[] = [...messages];

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    messageSend.push(newMessage);

    const loadMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "loading",
      content: "Loading...",
      timestamp: Date.now(),
    };
    set({ messageMainStream: "loading" });
    addMessage(newMessage);
    addMessage(loadMessage);
    setIsLoading(true);

    const stream: any = constructLlmApi({
      provider: "openai",
      apiKey:
        "sk-",
    })?.chatCompletionStream(
      {
        model: "o3-mini-2025-01-31",
        messages: messageSend.map((item) => {
          return {
            role: item.role,
            content: item.content,
          } as ChatCompletionSystemMessageParam;
        }),
        stream: true,
      },
      new AbortController().signal
    );

    let completion = "";
    for await (const result of stream) {
      completion += result.choices[0].delta.content ?? "";
      set({ messageMainStream: completion });
    }

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: completion,
      timestamp: Date.now(),
    };
    set({ messageMainStream: "" });
    addMessage(botResponse, { removeLast: true });
    setIsLoading(false);

    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     const botResponse: ChatMessage = {
    //       id: (Date.now() + 1).toString(),
    //       role: "assistant",
    //       content:
    //         "This is a simulated response. In a real application, this would be from an API call.",
    //       timestamp: Date.now(),
    //     };
    //     addMessage(botResponse, { removeLast: true });
    //     setIsLoading(false);
    //     resolve();
    //   }, 3000);
    // });
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
}));

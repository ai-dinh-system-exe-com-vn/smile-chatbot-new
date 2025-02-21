import { IndexedDBRepository } from "../IndexedDBRepository";

export type ChatMessage = {
  role: "user" | "system" | "assistant";
  id: string;
  questionId?: string;
  thinkProcessId?: string;
  content: string;
  timestamp: number;
};

export type ThinkProcess = {
  id: string;
  reasoning: string;
  prompt: string;
};

export type Conversation = {
  id: string; // Changed from number to string to be consistent
  title: string;
  isChangeTitle: boolean;
  persona?: string;
  customInstructions?: string;
  timestamp: number;
  isThinkMode?: boolean;
  messages: ChatMessage[];
  thinkProcess?: ThinkProcess[];
};

export const conversationRepository = new IndexedDBRepository<Conversation>(
  "conversations"
);

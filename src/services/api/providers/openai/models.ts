import { ModelProvider } from "../types";

export const OpenAi: ModelProvider = {
  models: [
    {
      model: "o3-mini",
      displayName: "o3 Mini",
      contextLength: 128000,
      maxCompletionTokens: 65536,
      recommendedFor: ["chat"],
    },
    // embed
    {
      model: "text-embedding-3-large",
      displayName: "Text Embedding 3-Large",
      recommendedFor: ["embed"],
    },
    {
      model: "text-embedding-3-small",
      displayName: "Text Embedding 3-Small",
    },
    {
      model: "text-embedding-ada-002",
      displayName: "Text Embedding Ada-002",
    },
  ],
  id: "openai",
  displayName: "OpenAI",
};

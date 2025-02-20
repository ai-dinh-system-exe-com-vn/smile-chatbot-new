import { BaseLlmApi } from "./api-base";
import { LLMConfig } from "./api-type";
import { OpenAIApi } from "./openai/api";

export function constructLlmApi(config: LLMConfig): BaseLlmApi | undefined {
  switch (config.provider) {
    case "openai":
      return new OpenAIApi(config);
    default:
      return undefined;
  }
}

import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { LLMConfig } from "./api/providers/api-type";
import { constructLlmApi } from "./api/providers/constructLlmApi";

export const completeSteam = async ({
  messageSend,
  onStream,
  config,
}: {
  messageSend: ChatCompletionMessageParam[];
  onStream(content: string): void;
  config: LLMConfig;
}) => {
  const stream: any = constructLlmApi(config)?.chatCompletionStream(
    {
      model: "o3-mini-2025-01-31",
      messages: messageSend,
      stream: true,
    },
    new AbortController().signal
  );

  let completion = "";
  for await (const result of stream) {
    completion += result.choices[0].delta.content ?? "";
    onStream(completion);
  }

  return completion;
};

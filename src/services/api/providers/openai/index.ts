import { ChatCompletionCreateParams } from "openai/resources/index";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { BaseLLM, toChatBody } from "..";
import { ChatMessage, CompletionOptions, LLMOptions } from "../types";

const formatMessageForO1 = (messages: ChatCompletionMessageParam[]) => {
  return messages?.map((message: any) => {
    if (message?.role === "system") {
      return {
        ...message,
        role: "user",
      };
    }

    return message;
  });
};

class OpenAI extends BaseLLM {
  public useLegacyCompletionsEndpoint: boolean | undefined = undefined;
  static providerName = "openai";
  static defaultOptions: Partial<LLMOptions> | undefined = {
    apiBase: "https://api.openai.com/v1/",
    maxEmbeddingBatchSize: 128,
  };

  constructor(options: LLMOptions) {
    super(options);
    this.useLegacyCompletionsEndpoint = options.useLegacyCompletionsEndpoint;
    this.apiVersion = options.apiVersion ?? "2023-07-01-preview";
  }

  private isO3orO1Model(model?: string): boolean {
    return !!model && (model.startsWith("o1") || model.startsWith("o3"));
  }

  private isO3(model?: string): boolean {
    return !!model && model.startsWith("o3");
  }
  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private isIncompleteJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return false;
    } catch (e) {
      // Check for typical incomplete JSON patterns
      const lastChar = str.trim().slice(-1);
      return (
        str.includes("{") &&
        (!str.includes("}") ||
          lastChar === "," ||
          lastChar === '"' ||
          lastChar === ":" ||
          lastChar === "[" ||
          /[{[][ \n]*$/.test(str))
      );
    }
  }

  protected getMaxStopWords(): number {
    const url = new URL(this.apiBase!);

    if (this.maxStopWords !== undefined) {
      return this.maxStopWords;
    } else if (url.host === "api.deepseek.com") {
      return 16;
    } else if (
      url.port === "1337" ||
      url.host === "api.openai.com" ||
      url.host === "api.groq.com" ||
      this.apiType === "azure"
    ) {
      return 4;
    } else {
      return Infinity;
    }
  }
  protected supportsPrediction(model: string): boolean {
    const SUPPORTED_MODELS = ["gpt-4o-mini", "gpt-4o", "mistral-large"];
    return SUPPORTED_MODELS.some((m) => model.includes(m));
  }

  protected _convertArgs(
    options: CompletionOptions,
    messages: ChatMessage[]
  ): ChatCompletionCreateParams {
    const finalOptions = toChatBody(messages, options);

    finalOptions.stop = options.stop?.slice(0, this.getMaxStopWords());

    // OpenAI o1-preview and o1-mini or o3-mini:
    if (this.isO3orO1Model(options.model)) {
      // a) use max_completion_tokens instead of max_tokens
      finalOptions.max_completion_tokens = options.maxTokens;
      finalOptions.max_tokens = undefined;

      // b) don't support system message
      finalOptions.messages = formatMessageForO1(finalOptions.messages);
    }

    if (options.model === "o1") {
      finalOptions.stream = false;
    }

    if (options.prediction && this.supportsPrediction(options.model)) {
      if (finalOptions.presence_penalty) {
        // prediction doesn't support > 0
        finalOptions.presence_penalty = undefined;
      }
      if (finalOptions.frequency_penalty) {
        // prediction doesn't support > 0
        finalOptions.frequency_penalty = undefined;
      }
      finalOptions.max_completion_tokens = undefined;

      finalOptions.prediction = options.prediction;
    } else {
      finalOptions.prediction = undefined;
    }

    return finalOptions;
  }

  protected _getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "api-key": this.apiKey ?? "", // For Azure
    };
  }

  protected async *_streamComplete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions
  ): AsyncGenerator<string> {
    throw new Error("Not implemented");
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    signal: AbortSignal,
    options: CompletionOptions
  ): AsyncGenerator<ChatMessage> {
    if (!this.templateMessages) {
      throw new Error(
        "You must either implement templateMessages or _streamChat"
      );
    }

    for await (const chunk of this._streamComplete(
      this.templateMessages(messages),
      signal,
      options
    )) {
      yield { role: "assistant", content: chunk };
    }
  }

  protected async _complete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions
  ): Promise<string> {
    let completion = "";
    for await (const chunk of this._streamChat(
      [{ role: "user", content: prompt }],
      signal,
      options
    )) {
      completion += chunk.content;
    }

    return completion;
  }

  protected modifyChatBody(
    body: ChatCompletionCreateParams
  ): ChatCompletionCreateParams {
    body.stop = body.stop?.slice(0, this.getMaxStopWords());

    // OpenAI o1-preview and o1-mini or o3-mini:
    if (this.isO3orO1Model(body.model)) {
      // a) use max_completion_tokens instead of max_tokens
      body.max_completion_tokens = body.max_tokens;
      body.max_tokens = undefined;

      // b) don't support system message
      body.messages = formatMessageForO1(body.messages);
    }

    if (body.model === "o1") {
      // o1 doesn't support streaming
      body.stream = false;
    }

    if (body.prediction && this.supportsPrediction(body.model)) {
      if (body.presence_penalty) {
        // prediction doesn't support > 0
        body.presence_penalty = undefined;
      }
      if (body.frequency_penalty) {
        // prediction doesn't support > 0
        body.frequency_penalty = undefined;
      }
      body.max_completion_tokens = undefined;
    }

    if (body.tools?.length && !body.model?.startsWith("o3")) {
      // To ensure schema adherence: https://platform.openai.com/docs/guides/function-calling#parallel-function-calling-and-structured-outputs
      // In practice, setting this to true and asking for multiple tool calls
      // leads to "arguments" being something like '{"file": "test.ts"}{"file": "test.js"}'
      body.parallel_tool_calls = false;
    }

    return body;
  }

  private _getEmbedEndpoint() {
    if (!this.apiBase) {
      throw new Error(
        "No API base URL provided. Please set the 'apiBase' option in config.json",
      );
    }

    if (this.apiType === "azure") {
      return new URL(
        `openai/deployments/${this.deployment}/embeddings?api-version=${this.apiVersion}`,
        this.apiBase,
      );
    }
    return new URL("embeddings", this.apiBase);
  }

  protected extraBodyProperties(): Record<string, any> {
    return {};
  }

  protected async _embed(chunks: string[]): Promise<number[][]> {
    const resp = await this.fetch(this._getEmbedEndpoint(), {
      method: "POST",
      body: JSON.stringify({
        input: chunks,
        model: this.model,
        ...this.extraBodyProperties(),
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "api-key": this.apiKey ?? "", // For Azure
      },
    });

    if (!resp.ok) {
      throw new Error(await resp.text());
    }

    const data = (await resp.json()) as any;
    return data.data.map((result: { embedding: number[] }) => result.embedding);
  }
}

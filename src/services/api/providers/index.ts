import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { ChatCompletionAssistantMessageParam } from "openai/src/resources/index.js";
import { OpenAi } from "./openai/models";
import {
  ChatMessage,
  CompletionOptions,
  LLMFullCompletionOptions,
  LlmInfo,
  LLMOptions,
  ModelProvider,
  RequestOptions,
  TextMessagePart,
} from "./types";
import {
  compileChatMessages,
  pruneRawPromptFromTop,
} from "./utils/countTokens";
import { fetchwithRequestOptions } from "./utils/fetch";
import mergeJson from "./utils/merge";
import { renderChatMessage } from "./utils/messageContent";
import { withExponentialBackoff } from "./utils/withExponentialBackoff";

const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_CONTEXT_LENGTH = 8096;
const DEFAULT_TEMPERATURE = 0.5;
const CONTEXT_LENGTH_FOR_MODEL: { [name: string]: number } = {
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-0613": 4096,
  "gpt-3.5-turbo-16k": 16_384,
  "gpt-35-turbo-16k": 16_384,
  "gpt-35-turbo-0613": 4096,
  "gpt-35-turbo": 4096,
  "gpt-4": 4096,
  "gpt-4-32k": 32_000,
  "gpt-4-turbo-preview": 32_000,
};

export function toChatMessage(
  message: ChatMessage
): ChatCompletionMessageParam {
  if (message.role === "tool") {
    return {
      role: "tool",
      content: message.content,
      tool_call_id: message.toolCallId,
    };
  }
  if (message.role === "system") {
    return {
      role: "system",
      content: message.content,
    };
  }

  if (message.role === "assistant") {
    const msg: ChatCompletionAssistantMessageParam = {
      role: "assistant",
      content:
        typeof message.content === "string"
          ? message.content || " " // LM Studio (and other providers) don't accept empty content
          : message.content
              .filter((part) => part.type === "text")
              .map((part) => part as TextMessagePart), // can remove with newer typescript version
    };

    if (message.toolCalls) {
      msg.tool_calls = message.toolCalls.map((toolCall) => ({
        id: toolCall.id!,
        type: toolCall.type!,
        function: {
          name: toolCall.function?.name!,
          arguments: toolCall.function?.arguments!,
        },
      }));
    }
    return msg;
  } else {
    if (typeof message.content === "string") {
      return {
        role: "user",
        content: message.content ?? " ", // LM Studio (and other providers) don't accept empty content
      };
    }

    // If no multi-media is in the message, just send as text
    // for compatibility with OpenAI-"compatible" servers
    // that don't support multi-media format
    return {
      role: "user",
      content: !message.content.some((item) => item.type !== "text")
        ? message.content
            .map((item) => (item as TextMessagePart).text)
            .join("") || " "
        : message.content.map((part) => {
            if (part.type === "imageUrl") {
              return {
                type: "image_url" as const,
                image_url: {
                  url: part.imageUrl.url,
                  detail: "auto" as const,
                },
              };
            }
            return part;
          }),
    };
  }
}

export function toChatBody(
  messages: ChatMessage[],
  options: CompletionOptions
): ChatCompletionCreateParams {
  const params: ChatCompletionCreateParams = {
    messages: messages.map(toChatMessage, options),
    model: options.model,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    top_p: options.topP,
    frequency_penalty: options.frequencyPenalty,
    presence_penalty: options.presencePenalty,
    stream: options.stream ?? true,
    stop: options.stop,
    prediction: options.prediction,
    tool_choice: options.toolChoice,
  };

  if (options.tools?.length) {
    params.tools = options.tools.map((tool) => ({
      type: tool.type,
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
        strict: tool.function.strict,
      },
    }));
  }

  return params;
}

export const allModelProviders: ModelProvider[] = [OpenAi];

export const allLlms: LlmInfo[] = allModelProviders.flatMap((provider) =>
  provider.models.map((model) => ({ ...model, provider: provider.id }))
);

export function findLlmInfo(model: string): LlmInfo | undefined {
  return allLlms.find((llm) =>
    llm.regex ? llm.regex.test(model) : llm.model === model
  );
}

export abstract class BaseLLM {
  static providerName: string;
  static defaultOptions: Partial<LLMOptions> | undefined = undefined;
  private _llmOptions: LLMOptions;
  model: string;
  apiBase?: string;
  title?: string;
  uniqueId: string;
  systemMessage?: string;
  contextLength: number;
  maxStopWords?: number | undefined;
  completionOptions: CompletionOptions;
  requestOptions?: RequestOptions;
  templateMessages?: (messages: ChatMessage[]) => string;
  apiVersion?: string;
  apiType?: string;
  apiKey?: string;
  deployment?: string;

  get providerName(): string {
    return (this.constructor as typeof BaseLLM).providerName;
  }

  constructor(_options: LLMOptions) {
    this._llmOptions = _options;

    // Set default options
    const options = {
      title: (this.constructor as typeof BaseLLM).providerName,
      ...(this.constructor as typeof BaseLLM).defaultOptions,
      ..._options,
    };

    this.model = options.model;

    // Use @continuedev/llm-info package to autodetect certain parameters
    const llmInfo = findLlmInfo(this.model);

    this.title = options.title;
    this.uniqueId = options.uniqueId ?? "None";
    this.systemMessage = options.systemMessage;
    this.contextLength =
      options.contextLength ?? llmInfo?.contextLength ?? DEFAULT_CONTEXT_LENGTH;
    this.maxStopWords = options.maxStopWords ?? this.maxStopWords;
    this.completionOptions = {
      ...options.completionOptions,
      model: options.model || "gpt-4",
      maxTokens:
        options.completionOptions?.maxTokens ??
        (llmInfo?.maxCompletionTokens
          ? Math.min(
              llmInfo.maxCompletionTokens,
              // Even if the model has a large maxTokens, we don't want to use that every time,
              // because it takes away from the context length
              this.contextLength / 4
            )
          : DEFAULT_MAX_TOKENS),
    };
    this.requestOptions = options.requestOptions;
    this.deployment = options.deployment;

    // this.promptTemplates = {
    //   ...autodetectPromptTemplates(options.model, templateType),
    //   ...options.promptTemplates,
    // };
    // this.templateMessages =
    //   options.templateMessages ??
    //   autodetectTemplateFunction(
    //     options.model,
    //     this.providerName,
    //     options.template
    //   ) ??
    //   undefined;
    // this.writeLog = options.writeLog;
    // this.llmRequestHook = options.llmRequestHook;
    this.apiKey = options.apiKey;
    // this.apiKeyLocation = options.apiKeyLocation;
    // this.aiGatewaySlug = options.aiGatewaySlug;
    this.apiBase = options.apiBase;
    // this.cacheBehavior = options.cacheBehavior;

    // // watsonx deploymentId
    // this.deploymentId = options.deploymentId;

    // if (this.apiBase && !this.apiBase.endsWith("/")) {
    //   this.apiBase = `${this.apiBase}/`;
    // }
    // this.accountId = options.accountId;
    // this.capabilities = options.capabilities;
    // this.roles = options.roles;

    // this.deployment = options.deployment;
    // this.apiVersion = options.apiVersion;
    // this.apiType = options.apiType;
    // this.region = options.region;
    // this.projectId = options.projectId;
    // this.profile = options.profile;

    // this.openaiAdapter = this.createOpenAiAdapter();

    // this.maxEmbeddingBatchSize =
    //   options.maxEmbeddingBatchSize ?? DEFAULT_MAX_BATCH_SIZE;
    // this.maxEmbeddingChunkSize =
    //   options.maxEmbeddingChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;
    // this.embeddingId = `${this.constructor.name}::${this.model}::${this.maxEmbeddingChunkSize}`;
  }

  protected modifyChatBody(
    body: ChatCompletionCreateParams
  ): ChatCompletionCreateParams {
    return body;
  }

  supportsCompletions(): boolean {
    if (["openai", "azure"].includes(this.providerName)) {
      if (
        this.apiBase?.includes("api.groq.com") ||
        this.apiBase?.includes("api.mistral.ai") ||
        this.apiBase?.includes(":1337") ||
        this.apiBase?.includes("integrate.api.nvidia.com") ||
        this._llmOptions.useLegacyCompletionsEndpoint?.valueOf() === false
      ) {
        // Jan + Groq + Mistral don't support completions : (
        // Seems to be going out of style...
        return false;
      }
    }
    if (["groq", "mistral", "deepseek"].includes(this.providerName)) {
      return false;
    }
    return true;
  }

  private _parseCompletionOptions(options: LLMFullCompletionOptions) {
    const log = options.log ?? true;
    const raw = options.raw ?? false;
    options.log = undefined;

    const completionOptions: CompletionOptions = mergeJson(
      this.completionOptions,
      options
    );

    return { completionOptions, log, raw };
  }
  private _formatChatMessages(messages: ChatMessage[]): string {
    const msgsCopy = messages ? messages.map((msg) => ({ ...msg })) : [];
    let formatted = "";
    for (const msg of msgsCopy) {
      let contentToShow = "";
      if (msg.role === "tool") {
        contentToShow = msg.content;
      } else if (msg.role === "assistant" && msg.toolCalls) {
        contentToShow = msg.toolCalls
          ?.map(
            (toolCall) =>
              `${toolCall.function?.name}(${toolCall.function?.arguments})`
          )
          .join("\n");
      } else if ("content" in msg) {
        if (Array.isArray(msg.content)) {
          msg.content = renderChatMessage(msg);
        }
        contentToShow = msg.content;
      }

      formatted += `<${msg.role}>\n${contentToShow}\n\n`;
    }
    return formatted;
  }

  private _getSystemMessage(): string | undefined {
    // TODO: Merge with config system message
    return this.systemMessage;
  }

  private _templatePromptLikeMessages(prompt: string): string {
    if (!this.templateMessages) {
      return prompt;
    }

    const msgs: ChatMessage[] = [{ role: "user", content: prompt }];

    const systemMessage = this._getSystemMessage();
    if (systemMessage) {
      msgs.unshift({ role: "system", content: systemMessage });
    }

    return this.templateMessages(msgs);
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

  private _modifyCompletionOptions(
    completionOptions: CompletionOptions
  ): CompletionOptions {
    // As of 01/14/25 streaming is currently not available with o1
    // See these threads:
    // - https://github.com/continuedev/continue/issues/3698
    // - https://community.openai.com/t/streaming-support-for-o1-o1-2024-12-17-resulting-in-400-unsupported-value/1085043
    if (completionOptions.model === "o1") {
      completionOptions.stream = false;
    }

    return completionOptions;
  }

  private _compileChatMessages(
    options: CompletionOptions,
    messages: ChatMessage[],
    functions?: any[]
  ) {
    let contextLength = this.contextLength;
    if (
      options.model !== this.model &&
      options.model in CONTEXT_LENGTH_FOR_MODEL
    ) {
      contextLength =
        CONTEXT_LENGTH_FOR_MODEL[options.model] || DEFAULT_CONTEXT_LENGTH;
    }

    const isSupportImages = false;

    return compileChatMessages(
      options.model,
      messages,
      contextLength,
      options.maxTokens ?? DEFAULT_MAX_TOKENS,
      isSupportImages,
      undefined,
      functions,
      this.systemMessage
    );
  }

  protected async *_streamComplete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions
  ): AsyncGenerator<string> {
    throw new Error("Not implemented");
  }

  async *streamChat(
    _messages: ChatMessage[],
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {}
  ): AsyncGenerator<ChatMessage> {
    let { completionOptions, log } = this._parseCompletionOptions(options);

    completionOptions = this._modifyCompletionOptions(completionOptions);

    const messages = this._compileChatMessages(completionOptions, _messages);

    const prompt = this.templateMessages
      ? this.templateMessages(messages)
      : this._formatChatMessages(messages);

    let completion = "";

    try {
      if (this.templateMessages) {
        for await (const chunk of this._streamComplete(
          prompt,
          signal,
          completionOptions
        )) {
          completion += chunk;
          yield { role: "assistant", content: chunk };
        }
      } else {
        for await (const chunk of this._streamChat(
          messages,
          signal,
          completionOptions
        )) {
          completion += chunk.content;
          yield chunk;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }

    return {
      modelTitle: this.title ?? completionOptions.model,
      prompt,
      completion,
      completionOptions,
    };
  }

  protected async _complete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions
  ) {
    let completion = "";
    for await (const chunk of this._streamComplete(prompt, signal, options)) {
      completion += chunk;
    }
    return completion;
  }

  async complete(
    _prompt: string,
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {}
  ) {
    const { completionOptions, log, raw } =
      this._parseCompletionOptions(options);

    let prompt = pruneRawPromptFromTop(
      completionOptions.model,
      this.contextLength,
      _prompt,
      completionOptions.maxTokens ?? DEFAULT_MAX_TOKENS
    );

    if (!raw) {
      prompt = this._templatePromptLikeMessages(prompt);
    }

    let completion: string;

    completion = await this._complete(prompt, signal, completionOptions);

    return completion;
  }

  async chat(
    messages: ChatMessage[],
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {}
  ) {
    let completion = "";
    for await (const chunk of this.streamChat(messages, signal, options)) {
      completion += chunk.content;
    }
    return { role: "assistant" as const, content: completion };
  }

  fetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Custom Node.js fetch
    const customFetch = async (input: URL | RequestInfo, init: any) => {
      try {
        const resp = await fetchwithRequestOptions(
          new URL(input as any),
          { ...init },
          { ...this.requestOptions }
        );

        // Error mapping to be more helpful
        if (!resp.ok) {
          let text = await resp.text();
          if (resp.status === 404 && !resp.url.includes("/v1")) {
            if (text.includes("try pulling it first")) {
              const model = JSON.parse(text).error.split(" ")[1].slice(1, -1);
              text = `The model "${model}" was not found. To download it, run \`ollama run ${model}\`.`;
            } else if (text.includes("/api/chat")) {
              text =
                "The /api/chat endpoint was not found. This may mean that you are using an older version of Ollama that does not support /api/chat. Upgrading to the latest version will solve the issue.";
            } else {
              text =
                "This may mean that you forgot to add '/v1' to the end of your 'apiBase' in config.json.";
            }
          } else if (
            resp.status === 404 &&
            resp.url.includes("api.openai.com")
          ) {
            text =
              "You may need to add pre-paid credits before using the OpenAI API.";
          } else if (
            resp.status === 401 &&
            (resp.url.includes("api.mistral.ai") ||
              resp.url.includes("codestral.mistral.ai"))
          ) {
            if (resp.url.includes("codestral.mistral.ai")) {
              throw new Error(
                "You are using a Mistral API key, which is not compatible with the Codestral API. Please either obtain a Codestral API key, or use the Mistral API by setting 'apiBase' to 'https://api.mistral.ai/v1' in config.json."
              );
            } else {
              throw new Error(
                "You are using a Codestral API key, which is not compatible with the Mistral API. Please either obtain a Mistral API key, or use the the Codestral API by setting 'apiBase' to 'https://codestral.mistral.ai/v1' in config.json."
              );
            }
          }
          throw new Error(
            `HTTP ${resp.status} ${resp.statusText} from ${resp.url}\n\n${text}`
          );
        }

        return resp;
      } catch (e: any) {
        // Errors to ignore
        if (e.message.includes("/api/tags")) {
          throw new Error(`Error fetching tags: ${e.message}`);
        } else if (e.message.includes("/api/show")) {
          throw new Error(
            `HTTP ${e.response.status} ${e.response.statusText} from ${e.response.url}\n\n${e.response.body}`
          );
        } else {
          if (e.name !== "AbortError") {
            // Don't pollute console with abort errors. Check on name instead of instanceof, to avoid importing node-fetch here
            console.debug(
              `${e.message}\n\nCode: ${e.code}\nError number: ${e.errno}\nSyscall: ${e.erroredSysCall}\nType: ${e.type}\n\n${e.stack}`
            );
          }
          if (
            e.code === "ECONNREFUSED" &&
            e.message.includes("http://127.0.0.1:11434")
          ) {
            const message =
              "Unable to connect to local Ollama instance. Ollama may not be installed or may not running.";
            throw new Error(message);
          }
        }
        throw new Error(e.message);
      }
    };
    return withExponentialBackoff<Response>(
      () => customFetch(url, init) as any,
      5,
      0.5
    );
  }
}

export interface ChatBotProvider {
  sendConversation: (message: ChatMessage[]) => Promise<string>;
}

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";

export type TextMessagePart = {
  type: "text";
  text: string;
};

export type ImageMessagePart = {
  type: "imageUrl";
  imageUrl: { url: string };
};

export type MessagePart = TextMessagePart | ImageMessagePart;

export type MessageContent = string | MessagePart[];

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallDelta {
  id?: string;
  type?: "function";
  function?: {
    name?: string;
    arguments?: string;
  };
}

export interface ToolResultChatMessage {
  role: "tool";
  content: string;
  toolCallId: string;
}

export interface UserChatMessage {
  role: "user";
  content: MessageContent;
}

export interface AssistantChatMessage {
  role: "assistant";
  content: MessageContent;
  toolCalls?: ToolCallDelta[];
}

export interface SystemChatMessage {
  role: "system";
  content: string;
}

export type ChatMessage =
  | UserChatMessage
  | AssistantChatMessage
  | SystemChatMessage
  | ToolResultChatMessage;

export interface Tool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
    strict?: boolean | null;
  };

  displayTitle: string;
  wouldLikeTo: string;
  readonly: boolean;
  uri?: string;
}

interface ToolChoice {
  type: "function";
  function: {
    name: string;
  };
}
export interface Prediction {
  type: "content";
  content:
    | string
    | {
        type: "text";
        text: string;
      }[];
}

export interface BaseCompletionOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  minP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  mirostat?: number;
  stop?: string[];
  maxTokens?: number;
  numThreads?: number;
  useMmap?: boolean;
  keepAlive?: number;
  raw?: boolean;
  stream?: boolean;
  prediction?: Prediction;
  tools?: Tool[];
  toolChoice?: ToolChoice;
}

export interface CompletionOptions extends BaseCompletionOptions {
  model: string;
  reasoning_effort?: string;
}

export interface ClientCertificateOptions {
  cert: string;
  key: string;
  passphrase?: string;
}

export interface RequestOptions {
  timeout?: number;
  verifySsl?: boolean;
  caBundlePath?: string | string[];
  proxy?: string;
  headers?: { [key: string]: string };
  extraBodyProperties?: { [key: string]: any };
  noProxy?: string[];
  clientCertificate?: ClientCertificateOptions;
}

export type TemplateType =
  | "llama2"
  | "alpaca"
  | "zephyr"
  | "phi2"
  | "phind"
  | "anthropic"
  | "chatml"
  | "none"
  | "openchat"
  | "deepseek"
  | "xwin-coder"
  | "neural-chat"
  | "codellama-70b"
  | "llava"
  | "gemma"
  | "granite"
  | "llama3";

export type PromptTemplateFunction = (
  history: ChatMessage[],
  otherData: Record<string, string>
) => string | ChatMessage[];

export type PromptTemplate = string | PromptTemplateFunction;

export interface CacheBehavior {
  cacheSystemMessage?: boolean;
  cacheConversation?: boolean;
}

export interface ModelCapability {
  uploadImage?: boolean;
  tools?: boolean;
}
export enum ChatTemplate {
  None = "none",
  // TODO
}
export enum MediaType {
  Text = "text",
  Image = "image",
  Audio = "audio",
  Video = "video",
}
export type UseCase = "chat" | "autocomplete" | "rerank" | "embed";
export type ParameterType = "string" | "number" | "boolean";

export interface Parameter {
  key: string;
  required: boolean;
  valueType: ParameterType;
  displayName?: string;
  description?: string;
  defaultValue?: any;
}

export interface LlmInfo {
  model: string;
  // providers: string[]; // TODO: uncomment and deal with the consequences
  displayName?: string;
  description?: string;
  contextLength?: number;
  maxCompletionTokens?: number;
  regex?: RegExp;
  chatTemplate?: ChatTemplate;

  /** If not set, assumes "text" only */
  mediaTypes?: MediaType[];
  recommendedFor?: UseCase[];

  /** Any additional parameters required to configure the model */
  extraParameters?: Parameter[];
}

export interface LLMOptions {
  model: string;

  title?: string;
  uniqueId?: string;
  systemMessage?: string;
  contextLength?: number;
  maxStopWords?: number;
  completionOptions?: CompletionOptions;
  requestOptions?: RequestOptions;
  template?: TemplateType;
  promptTemplates?: Record<string, PromptTemplate>;
  templateMessages?: (messages: ChatMessage[]) => string;
  writeLog?: (str: string) => Promise<void>;
  llmRequestHook?: (model: string, prompt: string) => any;
  apiKey?: string;
  apiKeyLocation?: string;
  aiGatewaySlug?: string;
  apiBase?: string;
  cacheBehavior?: CacheBehavior;
  capabilities?: ModelCapability;
  // roles?: ModelRole[];

  useLegacyCompletionsEndpoint?: boolean;

  // Embedding options
  embeddingId?: string;
  maxEmbeddingChunkSize?: number;
  maxEmbeddingBatchSize?: number;

  // Cloudflare options
  accountId?: string;

  // Azure options
  deployment?: string;
  apiVersion?: string;
  apiType?: string;

  // AWS options
  profile?: string;
  modelArn?: string;

  // AWS and GCP Options
  region?: string;

  // GCP and Watsonx Options
  projectId?: string;

  // IBM watsonx Options
  deploymentId?: string;
}

export interface ModelProvider {
  id: string;
  displayName: string;
  // capabilities: ModelProviderCapability[]; // TODO: uncomment and deal with the consequences
  models: Omit<LlmInfo, "provider">[];

  /** Any additional parameters required to configure the model
   *
   * (other than apiKey, apiBase, which are assumed always. And of course model and provider always required)
   */
  extraParameters?: Parameter[];
}

export interface LLMFullCompletionOptions extends BaseCompletionOptions {
  log?: boolean;
  model?: string;
}

export type ContextItemUriTypes = "file" | "url";

export interface ContextItemUri {
  type: ContextItemUriTypes;
  value: string;
}

export interface ContextItem {
  content: string;
  name: string;
  description: string;
  editing?: boolean;
  editable?: boolean;
  icon?: string;
  uri?: ContextItemUri;
  hidden?: boolean;
}

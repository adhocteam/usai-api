/**
 * Type definitions for USAi API
 */

// Base configuration interface
export interface USAiConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// Model information
export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission: Array<{
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: string | null;
    is_blocking: boolean;
  }>;
  root: string;
  parent: string | null;
}

export interface ModelsResponse {
  object: 'list';
  data: Model[];
}

// Chat completion types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<{
        type: 'text' | 'image_url' | 'file';
        text?: string;
        image_url?: {
          url: string;
          detail?: 'low' | 'high' | 'auto';
        };
        file_name?: string;
        file?: {
          file_data: string;
        };
      }>;
  name?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionStreamChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
  };
  finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

export interface ChatCompletionStreamResponse {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionStreamChoice[];
}

// Embeddings types
export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  user?: string;
  input_type?: 'search_document' | 'search_query' | 'clustering' | 'classification';
  encoding_format?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary';
  truncate?: 'NONE' | 'START' | 'END';
}

export interface EmbeddingObject {
  object: 'embedding';
  embedding: number[];
  index: number;
}

export interface EmbeddingResponse {
  object: 'list';
  data: EmbeddingObject[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Error types
export interface USAiError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// Rate limiting
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

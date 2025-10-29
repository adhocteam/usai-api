import { HTTPClient } from './http-client';
import {
  USAiConfig,
  ModelsResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionStreamResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ChatMessage,
} from './types';
import * as fs from 'fs';

/**
 * Main USAi API client class
 */
export class USAiAPI {
  private httpClient: HTTPClient;

  constructor(config: USAiConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.baseUrl) {
      throw new Error('Base URL is required');
    }

    this.httpClient = new HTTPClient(config);
  }

  /**
   * List available AI models
   */
  async getModels(): Promise<ModelsResponse> {
    return this.httpClient.request<ModelsResponse>('/api/v1/models');
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (request.stream) {
      throw new Error('Use createChatCompletionStream for streaming responses');
    }

    return this.httpClient.request<ChatCompletionResponse>('/api/v1/chat/completions', {
      method: 'POST',
      body: request,
    });
  }

  /**
   * Create a streaming chat completion
   */
  async createChatCompletionStream(
    request: ChatCompletionRequest
  ): Promise<AsyncIterable<ChatCompletionStreamResponse>> {
    const streamRequest = { ...request, stream: true };

    const response = await this.httpClient.request<Response>('/api/v1/chat/completions', {
      method: 'POST',
      body: streamRequest,
      stream: true,
    });

    return this.processStreamResponse(response);
  }

  /**
   * Create embeddings
   */
  async createEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.httpClient.request<EmbeddingResponse>('/api/v1/embeddings', {
      method: 'POST',
      body: request,
    });
  }

  /**
   * Convenience method for simple text completion
   */
  async complete(
    model: string,
    prompt: string,
    options: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const requestBody: any = {
      model,
      messages,
    };

    // Only add optional parameters if they're defined
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.topP !== undefined) {
      requestBody.top_p = options.topP;
    }

    const response = await this.createChatCompletion(requestBody);

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === 'string') {
      return messageContent;
    }
    return '';
  }

  /**
   * Convenience method for simple text completion with streaming
   */
  async *completeStream(
    model: string,
    prompt: string,
    options: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): AsyncIterable<string> {
    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const requestBody: any = {
      model,
      messages,
      stream: true,
    };

    // Only add optional parameters if they're defined
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.topP !== undefined) {
      requestBody.top_p = options.topP;
    }

    const stream = await this.createChatCompletionStream(requestBody);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Process streaming response from the API
   */
  private async *processStreamResponse(
    response: Response
  ): AsyncIterable<ChatCompletionStreamResponse> {
    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed === '') {
            continue;
          }

          if (trimmed === 'data: [DONE]') {
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const jsonData = trimmed.slice(6);
              const parsed = JSON.parse(jsonData) as ChatCompletionStreamResponse;
              yield parsed;
            } catch (error) {
              console.warn('Failed to parse streaming response:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Utility: Encode image file as data URI for multimodal inputs
   */
  static encodeImageAsDataUri(imagePath: string, mimeType?: string): string {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const detectedMimeType = mimeType || USAiAPI.detectImageMimeType(imagePath);
      const base64Data = imageBuffer.toString('base64');
      return `data:${detectedMimeType};base64,${base64Data}`;
    } catch (error) {
      throw new Error(`Failed to encode image: ${(error as Error).message}`);
    }
  }

  /**
   * Utility: Encode PDF file as data URI for document processing
   */
  static encodePdfAsDataUri(pdfPath: string): string {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const base64Data = pdfBuffer.toString('base64');
      return `data:application/pdf;base64,${base64Data}`;
    } catch (error) {
      throw new Error(`Failed to encode PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Utility: Encode any file as data URI
   */
  static encodeFileAsDataUri(filePath: string, mimeType?: string): string {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const detectedMimeType = mimeType || USAiAPI.detectFileMimeType(filePath);
      const base64Data = fileBuffer.toString('base64');
      return `data:${detectedMimeType};base64,${base64Data}`;
    } catch (error) {
      throw new Error(`Failed to encode file: ${(error as Error).message}`);
    }
  }

  /**
   * Helper: Detect image MIME type from file extension
   */
  private static detectImageMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  /**
   * Helper: Detect file MIME type from file extension
   */
  private static detectFileMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Convenience: Create a chat completion with document analysis
   */
  async analyzeDocument(
    model: string,
    documentPath: string,
    prompt: string,
    options: {
      systemPrompt?: string;
      fileName?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const encodedFile = USAiAPI.encodeFileAsDataUri(documentPath);
    const fileName = options.fileName || documentPath.split('/').pop() || 'document';

    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'file',
          file_name: fileName,
          file: {
            file_data: encodedFile,
          },
        },
      ],
    });

    const requestBody: any = {
      model,
      messages,
    };

    // Only add optional parameters if they're defined
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }

    const response = await this.createChatCompletion(requestBody);

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === 'string') {
      return messageContent;
    }
    return '';
  }

  /**
   * Convenience: Create a chat completion with image analysis
   */
  async analyzeImage(
    model: string,
    imagePath: string,
    prompt: string,
    options: {
      systemPrompt?: string;
      detail?: 'low' | 'high' | 'auto';
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const encodedImage = USAiAPI.encodeImageAsDataUri(imagePath);

    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: encodedImage,
            detail: options.detail || 'auto',
          },
        },
      ],
    });

    const requestBody: any = {
      model,
      messages,
    };

    // Only add optional parameters if they're defined
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }

    const response = await this.createChatCompletion(requestBody);

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === 'string') {
      return messageContent;
    }
    return '';
  }
}

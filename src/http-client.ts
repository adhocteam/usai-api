import { USAiConfig, USAiError, RateLimitInfo } from './types';
import {
  USAiAPIError,
  USAiRateLimitError,
  USAiAuthenticationError,
  USAiPermissionError,
  USAiNotFoundError,
  USAiConnectionError,
  USAiTimeoutError,
} from './errors';

/**
 * HTTP client for making requests to the USAi API
 */
export class HTTPClient {
  private config: USAiConfig;

  constructor(config: USAiConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Make an HTTP request with retry logic and error handling
   */
  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      stream?: boolean;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, stream = false } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestHeaders = {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'usai-api-node/1.0.0',
      ...headers,
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (stream) {
            return response as unknown as T;
          }
          return (await response.json()) as T;
        }

        // Handle specific error status codes
        await this.handleErrorResponse(response);
      } catch (error) {
        lastError = error as Error;

        if (error instanceof USAiRateLimitError && attempt < (this.config.maxRetries || 3)) {
          // Exponential backoff for rate limits
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt);
          const retryAfter = error.retryAfter ? error.retryAfter * 1000 : delay;
          await this.sleep(retryAfter);
          continue;
        }

        if (error instanceof USAiConnectionError && attempt < (this.config.maxRetries || 3)) {
          // Retry connection errors with exponential backoff
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        // Don't retry for authentication, permission, or not found errors
        if (
          error instanceof USAiAuthenticationError ||
          error instanceof USAiPermissionError ||
          error instanceof USAiNotFoundError
        ) {
          throw error;
        }

        if ((error as any)?.name === 'AbortError') {
          throw new USAiTimeoutError('Request timed out');
        }

        if (attempt === (this.config.maxRetries || 3)) {
          throw error;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: USAiError;

    try {
      errorData = (await response.json()) as USAiError;
    } catch {
      // If we can't parse the error response, create a generic error
      errorData = {
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          type: 'api_error',
        },
      };
    }

    const { message, type, code, param } = errorData.error;

    switch (response.status) {
      case 401:
        throw new USAiAuthenticationError(message);
      case 403:
        throw new USAiPermissionError(message);
      case 404:
        throw new USAiNotFoundError(message);
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new USAiRateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
      default:
        throw new USAiAPIError(message, type, code, param, response.status);
    }
  }

  /**
   * Extract rate limit information from response headers
   */
  getRateLimitInfo(response: Response): RateLimitInfo | null {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const limit = response.headers.get('X-RateLimit-Limit');

    if (remaining && reset && limit) {
      return {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        limit: parseInt(limit, 10),
      };
    }

    return null;
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

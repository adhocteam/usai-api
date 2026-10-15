import { USAiConfig, USAiError, RateLimitInfo, USAiRateLimits } from './types';
import {
  USAiAPIError,
  USAiRateLimitError,
  USAiBudgetLimitError,
  USAiConnectionError,
  USAiTimeoutError,
  createUSAiError,
} from './errors';
import { RateLimiter } from './rate-limiter';

/**
 * HTTP client for making requests to the USAi API
 */
export class HTTPClient {
  private config: USAiConfig;
  private rateLimiters = new Map<string, RateLimiter>();

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
    const maxRetries = this.config.maxRetries ?? 3;
    const retryDelay = this.config.retryDelay ?? 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.getRateLimiter(endpoint)?.acquire();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        let response: Response;
        try {
          response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.ok) {
          if (stream) {
            return response as unknown as T;
          }
          return (await response.json()) as T;
        }

        // Handle specific error status codes
        await this.handleErrorResponse(response);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          throw new USAiTimeoutError('Request timed out');
        }

        lastError = error as Error;

        if (attempt >= maxRetries || !this.isRetryable(lastError)) {
          throw lastError;
        }

        // Exponential backoff, honoring Retry-After for rate limits
        const backoff = retryDelay * Math.pow(2, attempt);
        const delay =
          lastError instanceof USAiRateLimitError && lastError.retryAfter
            ? lastError.retryAfter * 1000
            : backoff;
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Determine whether a failed request should be retried. Client errors (4xx),
   * including budget limits and content filter rejections, are not retried.
   */
  private isRetryable(error: Error): boolean {
    if (error instanceof USAiBudgetLimitError) {
      return false;
    }
    if (error instanceof USAiRateLimitError || error instanceof USAiConnectionError) {
      return true;
    }
    if (error instanceof USAiAPIError) {
      return error.statusCode === undefined || error.statusCode >= 500;
    }
    // Network-level failures (e.g. fetch TypeError)
    return true;
  }

  private getRateLimiter(endpoint: string): RateLimiter | undefined {
    if (!this.config.throttleRequests) {
      return undefined;
    }
    const limit = USAiRateLimits[endpoint];
    if (!limit) {
      return undefined;
    }
    let limiter = this.rateLimiters.get(endpoint);
    if (!limiter) {
      limiter = new RateLimiter(limit);
      this.rateLimiters.set(endpoint, limiter);
    }
    return limiter;
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: Partial<USAiError> | undefined;

    try {
      errorData = (await response.json()) as Partial<USAiError>;
    } catch {
      errorData = undefined;
    }

    const details = errorData?.error ?? {
      message: `HTTP ${response.status}: ${response.statusText}`,
      type: 'api_error',
    };

    let retryAfter: number | undefined;
    if (response.status === 429) {
      const header = response.headers.get('Retry-After');
      const parsed = header ? parseInt(header, 10) : NaN;
      retryAfter = Number.isNaN(parsed) ? undefined : parsed;
    }

    throw createUSAiError(details, response.status, retryAfter);
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

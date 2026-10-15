/**
 * Custom error classes for USAi API
 */

export class USAiAPIError extends Error {
  public readonly type: string;
  public readonly code?: string;
  public readonly param?: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    type: string = 'api_error',
    code?: string,
    param?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'USAiAPIError';
    this.type = type;
    this.code = code;
    this.param = param;
    this.statusCode = statusCode;
  }
}

export class USAiRateLimitError extends USAiAPIError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, type: string = 'rate_limit_error') {
    super(message, type, undefined, undefined, 429);
    this.name = 'USAiRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Raised when the weekly per-person cost limit set by an agency has been reached.
 * Unlike transient rate limits, this is not retried; budgets reset each Monday.
 */
export class USAiBudgetLimitError extends USAiRateLimitError {
  constructor(message: string) {
    super(message, undefined, 'budget_limit_error');
    this.name = 'USAiBudgetLimitError';
  }
}

/**
 * Raised when platform content filtering (e.g. Azure DefaultV2 guardrails on
 * OpenAI and xAI models) blocks a prompt or response.
 */
export class USAiContentFilterError extends USAiAPIError {
  constructor(message: string, code?: string, param?: string, statusCode?: number) {
    super(message, 'content_filter_error', code, param, statusCode);
    this.name = 'USAiContentFilterError';
  }
}

export class USAiAuthenticationError extends USAiAPIError {
  constructor(message: string) {
    super(message, 'authentication_error', undefined, undefined, 401);
    this.name = 'USAiAuthenticationError';
  }
}

export class USAiPermissionError extends USAiAPIError {
  constructor(message: string) {
    super(message, 'permission_error', undefined, undefined, 403);
    this.name = 'USAiPermissionError';
  }
}

export class USAiNotFoundError extends USAiAPIError {
  constructor(message: string) {
    super(message, 'not_found_error', undefined, undefined, 404);
    this.name = 'USAiNotFoundError';
  }
}

export class USAiConnectionError extends USAiAPIError {
  constructor(message: string) {
    super(message, 'connection_error');
    this.name = 'USAiConnectionError';
  }
}

export class USAiTimeoutError extends USAiAPIError {
  constructor(message: string) {
    super(message, 'timeout_error');
    this.name = 'USAiTimeoutError';
  }
}

interface ErrorDetails {
  message?: unknown;
  type?: unknown;
  code?: unknown;
  param?: unknown;
}

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

const CONTENT_FILTER_PATTERN =
  /content[_ ]?filter|content management policy|responsibleaipolicyviolation/i;

/**
 * Build the appropriate error for an API error payload.
 * @param details - The `error` object from the API response or stream chunk
 * @param statusCode - HTTP status code, if available (absent for stream error chunks)
 * @param retryAfter - Parsed Retry-After header in seconds, if present
 */
export function createUSAiError(
  details: ErrorDetails | undefined,
  statusCode?: number,
  retryAfter?: number
): USAiAPIError {
  const message =
    optionalString(details?.message) ??
    (statusCode ? `HTTP ${statusCode}` : 'Unknown error returned by USAi API');
  const type = optionalString(details?.type);
  const code = optionalString(details?.code);
  const param = optionalString(details?.param);

  const isContentFilter = [code, type, message].some(
    (value) => value !== undefined && CONTENT_FILTER_PATTERN.test(value)
  );
  if (isContentFilter && (statusCode === undefined || statusCode === 400)) {
    return new USAiContentFilterError(message, code, param, statusCode);
  }

  switch (statusCode) {
    case 401:
      return new USAiAuthenticationError(message);
    case 403:
      return new USAiPermissionError(message);
    case 404:
      return new USAiNotFoundError(message);
    case 429:
      if (/budget/i.test(message)) {
        return new USAiBudgetLimitError(message);
      }
      return new USAiRateLimitError(message, retryAfter);
    default:
      return new USAiAPIError(message, type, code, param, statusCode);
  }
}

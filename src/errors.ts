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

  constructor(message: string, retryAfter?: number) {
    super(message, 'rate_limit_error', undefined, undefined, 429);
    this.name = 'USAiRateLimitError';
    this.retryAfter = retryAfter;
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

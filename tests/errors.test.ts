import {
  USAiAPIError,
  USAiRateLimitError,
  USAiAuthenticationError,
  USAiPermissionError,
  USAiNotFoundError,
  USAiConnectionError,
  USAiTimeoutError
} from '../src/errors';

describe('Error Classes', () => {
  describe('USAiAPIError', () => {
    it('should create error with message and type', () => {
      const error = new USAiAPIError('Test error', 'test_error');
      expect(error.message).toBe('Test error');
      expect(error.type).toBe('test_error');
      expect(error.name).toBe('USAiAPIError');
    });

    it('should include optional parameters', () => {
      const error = new USAiAPIError(
        'Test error',
        'test_error',
        'E001',
        'test_param',
        400
      );
      expect(error.code).toBe('E001');
      expect(error.param).toBe('test_param');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('USAiRateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new USAiRateLimitError('Rate limited', 60);
      expect(error.message).toBe('Rate limited');
      expect(error.type).toBe('rate_limit_error');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('USAiRateLimitError');
    });
  });

  describe('USAiAuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new USAiAuthenticationError('Invalid API key');
      expect(error.message).toBe('Invalid API key');
      expect(error.type).toBe('authentication_error');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('USAiAuthenticationError');
    });
  });

  describe('USAiPermissionError', () => {
    it('should create permission error', () => {
      const error = new USAiPermissionError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.type).toBe('permission_error');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('USAiPermissionError');
    });
  });

  describe('USAiNotFoundError', () => {
    it('should create not found error', () => {
      const error = new USAiNotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.type).toBe('not_found_error');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('USAiNotFoundError');
    });
  });

  describe('USAiConnectionError', () => {
    it('should create connection error', () => {
      const error = new USAiConnectionError('Connection failed');
      expect(error.message).toBe('Connection failed');
      expect(error.type).toBe('connection_error');
      expect(error.name).toBe('USAiConnectionError');
    });
  });

  describe('USAiTimeoutError', () => {
    it('should create timeout error', () => {
      const error = new USAiTimeoutError('Request timed out');
      expect(error.message).toBe('Request timed out');
      expect(error.type).toBe('timeout_error');
      expect(error.name).toBe('USAiTimeoutError');
    });
  });
});

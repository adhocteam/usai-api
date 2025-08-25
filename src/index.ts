/**
 * USAi API Node.js Client Library
 *
 * A Node.js client library for the USAi.gov API - Government AI service
 * with OpenAI-compatible interface supporting Claude, Llama, Gemini and more.
 */

export { USAiAPI } from './client';
export { HTTPClient } from './http-client';

// Export all types
export * from './types';

// Export all errors
export * from './errors';

// Default export for convenience
export { USAiAPI as default } from './client';

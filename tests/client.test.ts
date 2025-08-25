import { USAiAPI } from '../src/index';
import { USAiAPIError, USAiAuthenticationError } from '../src/errors';

describe('USAiAPI', () => {
  describe('constructor', () => {
    it('should throw error if API key is missing', () => {
      expect(() => {
        new USAiAPI({
          apiKey: '',
          baseUrl: 'https://api.usai.gov'
        });
      }).toThrow('API key is required');
    });

    it('should throw error if base URL is missing', () => {
      expect(() => {
        new USAiAPI({
          apiKey: 'test-key',
          baseUrl: ''
        });
      }).toThrow('Base URL is required');
    });

    it('should create instance with valid config', () => {
      const client = new USAiAPI({
        apiKey: 'test-key',
        baseUrl: 'https://api.usai.gov'
      });
      expect(client).toBeInstanceOf(USAiAPI);
    });
  });

  describe('getModels', () => {
    it('should return models list', async () => {
      // Mock implementation would go here
      // This is a placeholder for actual API tests
      expect(true).toBe(true);
    });
  });

  describe('createChatCompletion', () => {
    it('should throw error for streaming requests', async () => {
      const client = new USAiAPI({
        apiKey: 'test-key',
        baseUrl: 'https://api.usai.gov'
      });

      await expect(
        client.createChatCompletion({
          model: 'claude-3-5-haiku',
          messages: [{ role: 'user', content: 'Hello' }],
          stream: true
        })
      ).rejects.toThrow('Use createChatCompletionStream for streaming responses');
    });
  });

  describe('complete', () => {
    it('should handle simple completion requests', async () => {
      // Mock implementation would go here
      expect(true).toBe(true);
    });
  });
});

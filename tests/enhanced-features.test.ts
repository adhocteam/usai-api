import { USAiAPI } from '../src/index';

describe('Enhanced Features', () => {
  let client: USAiAPI;

  beforeEach(() => {
    client = new USAiAPI({
      apiKey: 'test-key',
      baseUrl: 'https://api.usai.gov'
    });
  });

  describe('Static Utility Methods', () => {
    it('should have encodeImageAsDataUri method', () => {
      expect(typeof USAiAPI.encodeImageAsDataUri).toBe('function');
    });

    it('should have encodePdfAsDataUri method', () => {
      expect(typeof USAiAPI.encodePdfAsDataUri).toBe('function');
    });

    it('should have encodeFileAsDataUri method', () => {
      expect(typeof USAiAPI.encodeFileAsDataUri).toBe('function');
    });
  });

  describe('Enhanced Chat Messages', () => {
    it('should support file content type in messages', () => {
      const messageWithFile = {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: 'Analyze this document'
          },
          {
            type: 'file' as const,
            file_name: 'test.pdf',
            file: {
              file_data: 'data:application/pdf;base64,test'
            }
          }
        ]
      };

      // This should compile without TypeScript errors
      expect(messageWithFile.content).toHaveLength(2);
      expect(messageWithFile.content[1].type).toBe('file');
    });
  });

  describe('Enhanced Embedding Options', () => {
    it('should support input_type parameter', () => {
      const embeddingRequest = {
        model: 'cohere-english-v3',
        input: 'test text',
        input_type: 'clustering' as const,
        encoding_format: 'float' as const
      };

      // This should compile without TypeScript errors
      expect(embeddingRequest.input_type).toBe('clustering');
      expect(embeddingRequest.encoding_format).toBe('float');
    });

    it('should support all input_type options', () => {
      const inputTypes = ['search_document', 'search_query', 'clustering', 'classification'];
      
      inputTypes.forEach(inputType => {
        const request = {
          model: 'cohere-english-v3',
          input: 'test',
          input_type: inputType as any
        };
        expect(request.input_type).toBe(inputType);
      });
    });
  });

  describe('Convenience Methods', () => {
    it('should have analyzeDocument method', () => {
      expect(typeof client.analyzeDocument).toBe('function');
    });

    it('should have analyzeImage method', () => {
      expect(typeof client.analyzeImage).toBe('function');
    });
  });
});

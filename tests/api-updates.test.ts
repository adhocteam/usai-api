import {
  USAiAPI,
  USAiModels,
  USAiAPIError,
  USAiRateLimitError,
  USAiBudgetLimitError,
  USAiContentFilterError,
  ChatCompletionRequest,
  ChatCompletionStreamResponse,
} from '../src/index';

const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const sseResponse = (lines: string[]) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(lines.join('\n') + '\n'));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
};

const chatResponse = {
  object: 'chat.completion',
  created: 1748517745,
  model: 'gemini-2.5-flash',
  choices: [{ index: 0, message: { role: 'assistant', content: 'Ahoy!' }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 14, completion_tokens: 15, total_tokens: 29 },
};

describe('API documentation alignment', () => {
  let fetchMock: jest.Mock;
  let client: USAiAPI;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    client = new USAiAPI({ apiKey: 'test-key', baseUrl: 'https://api.usai.gov', retryDelay: 1 });
  });

  describe('model constants', () => {
    it('uses identifier formats from the official examples', () => {
      expect(USAiModels.GEMINI_2_5_FLASH).toBe('gemini-2.5-flash');
      expect(USAiModels.CLAUDE_4_5_SONNET).toBe('claude_4_5_sonnet');
      expect(USAiModels.CLAUDE_4_5_HAIKU).toBe('claude_4_5_haiku');
      expect(USAiModels.LLAMA_4_MAVERICK).toBe('llama_4_maverick');
      expect(USAiModels.COHERE_ENGLISH_V3).toBe('cohere_english_v3');
    });

    it('includes newly documented providers and models', () => {
      expect(USAiModels.CLAUDE_5_OPUS).toBeDefined();
      expect(USAiModels.GEMINI_3_8_FLASH).toBeDefined();
      expect(USAiModels.GPT_6_ASTRA).toBeDefined();
    });

    it('drops models no longer listed in the documentation', () => {
      expect(USAiModels).not.toHaveProperty('CLAUDE_3_5_HAIKU');
      expect(USAiModels).not.toHaveProperty('CLAUDE_4_OPUS');
    });
  });

  describe('getModels', () => {
    it('accepts the documented response shape without permission metadata', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          object: 'list',
          data: [{ id: 'claude_4_5_sonnet', created: 1718841600, object: 'model', owned_by: 'Anthropic' }],
        })
      );

      const models = await client.getModels();
      expect(models.data[0].id).toBe('claude_4_5_sonnet');
      expect(models.data[0].permission).toBeUndefined();
    });
  });

  describe('tool calling', () => {
    it('sends tools and tool messages and returns tool calls', async () => {
      const toolCall = {
        id: 'call_1',
        type: 'function' as const,
        function: { name: 'magic_number', arguments: '{"factor":100}' },
      };
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          ...chatResponse,
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: null, tool_calls: [toolCall] },
              finish_reason: 'tool_calls',
            },
          ],
        })
      );

      const request: ChatCompletionRequest = {
        model: USAiModels.GEMINI_2_5_FLASH,
        messages: [
          { role: 'user', content: 'Generate a magic number' },
          { role: 'assistant', tool_calls: [toolCall] },
          { role: 'tool', tool_call_id: 'call_1', content: '{"magic_number":4200}' },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'magic_number',
              description: 'Generates a magic number',
              parameters: { type: 'object', properties: { factor: { type: 'number' } } },
            },
          },
        ],
        tool_choice: 'auto',
      };

      const response = await client.createChatCompletion(request);

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody.tools[0].function.name).toBe('magic_number');
      expect(sentBody.messages[2]).toEqual({
        role: 'tool',
        tool_call_id: 'call_1',
        content: '{"magic_number":4200}',
      });
      expect(response.choices[0].finish_reason).toBe('tool_calls');
      expect(response.choices[0].message.tool_calls?.[0].function.name).toBe('magic_number');
    });
  });

  describe('temperature validation', () => {
    it.each([-0.1, 1.5, Number.NaN])('rejects temperature %p', async (temperature) => {
      await expect(
        client.createChatCompletion({
          model: USAiModels.GEMINI_2_5_FLASH,
          messages: [{ role: 'user', content: 'Hi' }],
          temperature,
        })
      ).rejects.toMatchObject({ type: 'invalid_request_error', param: 'temperature' });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects invalid temperature for streaming requests', async () => {
      await expect(
        client.createChatCompletionStream({
          model: USAiModels.GEMINI_2_5_FLASH,
          messages: [{ role: 'user', content: 'Hi' }],
          temperature: 2,
        })
      ).rejects.toBeInstanceOf(USAiAPIError);
    });

    it.each([0, 0.7, 1])('accepts temperature %p', async (temperature) => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, chatResponse));
      await expect(
        client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi', { temperature })
      ).resolves.toBe('Ahoy!');
    });
  });

  describe('error handling and retries', () => {
    it('does not retry when the weekly budget limit is reached', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(429, { error: { message: 'budget limit reached for this billing cycle.' } })
      );

      const promise = client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi');
      await expect(promise).rejects.toBeInstanceOf(USAiBudgetLimitError);
      await expect(promise).rejects.toBeInstanceOf(USAiRateLimitError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('retries transient rate limit errors', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(429, { error: { message: 'Too many requests' } }))
        .mockResolvedValueOnce(jsonResponse(200, chatResponse));

      await expect(client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi')).resolves.toBe('Ahoy!');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('raises a non-retried content filter error for guardrail 400s', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(400, {
          error: {
            message: "The response was filtered due to the prompt triggering content management policy.",
            type: null,
            param: 'prompt',
            code: 'content_filter',
          },
        })
      );

      const promise = client.complete(USAiModels.GPT_5_5, 'Hi');
      await expect(promise).rejects.toBeInstanceOf(USAiContentFilterError);
      await expect(promise).rejects.toMatchObject({ statusCode: 400, code: 'content_filter' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not retry other client errors', async () => {
      fetchMock.mockResolvedValue(jsonResponse(400, { error: { message: 'bad model', type: 'invalid_request_error' } }));

      await expect(client.complete('unknown', 'Hi')).rejects.toMatchObject({
        statusCode: 400,
        type: 'invalid_request_error',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('retries server errors', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(503, { error: { message: 'unavailable' } }))
        .mockResolvedValueOnce(jsonResponse(200, chatResponse));

      await expect(client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi')).resolves.toBe('Ahoy!');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('handles error bodies without an error object', async () => {
      fetchMock.mockResolvedValue(jsonResponse(422, { detail: 'Unprocessable' }));

      await expect(client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi')).rejects.toMatchObject({
        statusCode: 422,
      });
    });

    it('respects maxRetries of zero', async () => {
      client = new USAiAPI({ apiKey: 'k', baseUrl: 'https://api.usai.gov', maxRetries: 0 });
      fetchMock.mockResolvedValue(jsonResponse(503, { error: { message: 'unavailable' } }));

      await expect(client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi')).rejects.toBeInstanceOf(USAiAPIError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('streaming', () => {
    it('yields content chunks until [DONE]', async () => {
      fetchMock.mockResolvedValueOnce(
        sseResponse([
          'data: {"choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}',
          'data: {"choices":[{"index":0,"delta":{"content":" there"},"finish_reason":"stop"}]}',
          'data: [DONE]',
        ])
      );

      const parts: string[] = [];
      for await (const part of client.completeStream(USAiModels.GEMINI_2_5_FLASH, 'Hi')) {
        parts.push(part);
      }
      expect(parts.join('')).toBe('Hello there');
    });

    it('throws a content filter error when the stream contains an error chunk', async () => {
      fetchMock.mockResolvedValueOnce(
        sseResponse([
          'data: {"choices":[{"index":0,"delta":{"content":"Partial"},"finish_reason":null}]}',
          'data: {"error":{"message":"Content filtered","code":"content_filter"}}',
          'data: [DONE]',
        ])
      );

      const parts: string[] = [];
      await expect(
        (async () => {
          for await (const part of client.completeStream(USAiModels.GPT_5_5, 'Hi')) {
            parts.push(part);
          }
        })()
      ).rejects.toBeInstanceOf(USAiContentFilterError);
      expect(parts).toEqual(['Partial']);
    });

    it('throws a generic API error for non-guardrail error chunks', async () => {
      fetchMock.mockResolvedValueOnce(sseResponse(['data: {"error":{"message":"Upstream failure"}}']));

      const stream = await client.createChatCompletionStream({
        model: USAiModels.GEMINI_2_5_FLASH,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      const iterate = async () => {
        for await (const _chunk of stream) {
          // consume
        }
      };
      await expect(iterate()).rejects.toMatchObject({ message: 'Upstream failure' });
    });

    it('passes through streamed tool call deltas', async () => {
      fetchMock.mockResolvedValueOnce(
        sseResponse([
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"magic_number","arguments":""}}]},"finish_reason":null}]}',
          'data: {"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}',
          'data: [DONE]',
        ])
      );

      const stream = await client.createChatCompletionStream({
        model: USAiModels.GEMINI_2_5_FLASH,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      const chunks: ChatCompletionStreamResponse[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      expect(chunks[0].choices[0].delta.tool_calls?.[0].function?.name).toBe('magic_number');
      expect(chunks[1].choices[0].finish_reason).toBe('tool_calls');
    });
  });

  describe('embeddings', () => {
    it('sends documented fields and normalizes camelCase usage', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          object: 'list',
          data: [{ object: 'embedding', embedding: [0.1, 0.2], index: 0 }],
          model: 'cohere.embed-english-v3',
          usage: { promptTokens: 12, totalTokens: 12 },
        })
      );

      const response = await client.createEmbedding({
        model: USAiModels.COHERE_ENGLISH_V3,
        input: 'A mighty woman with a torch',
        input_type: 'search_document',
        encodingFormat: 'float',
        dimensions: 256,
      });

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody).toMatchObject({ encodingFormat: 'float', dimensions: 256, model: 'cohere_english_v3' });
      expect(response.usage).toEqual({
        promptTokens: 12,
        totalTokens: 12,
        prompt_tokens: 12,
        total_tokens: 12,
      });
    });

    it('preserves snake_case usage when already present', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          object: 'list',
          data: [],
          model: 'cohere_english_v3',
          usage: { prompt_tokens: 3, total_tokens: 3 },
        })
      );

      const response = await client.createEmbedding({ model: USAiModels.COHERE_ENGLISH_V3, input: 'x' });
      expect(response.usage.prompt_tokens).toBe(3);
      expect(response.usage.total_tokens).toBe(3);
    });
  });

  describe('client-side throttling', () => {
    it('limits chat completions to the documented 3 requests per second', async () => {
      jest.useFakeTimers();
      try {
        client = new USAiAPI({ apiKey: 'k', baseUrl: 'https://api.usai.gov', throttleRequests: true });
        fetchMock.mockImplementation(async () => jsonResponse(200, chatResponse));

        const requests = Array.from({ length: 4 }, () =>
          client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi')
        );

        await jest.advanceTimersByTimeAsync(10);
        expect(fetchMock).toHaveBeenCalledTimes(3);

        await jest.advanceTimersByTimeAsync(1000);
        expect(fetchMock).toHaveBeenCalledTimes(4);
        await expect(Promise.all(requests)).resolves.toHaveLength(4);
      } finally {
        jest.useRealTimers();
      }
    });

    it('does not throttle by default', async () => {
      fetchMock.mockImplementation(async () => jsonResponse(200, chatResponse));

      await Promise.all(
        Array.from({ length: 5 }, () => client.complete(USAiModels.GEMINI_2_5_FLASH, 'Hi'))
      );
      expect(fetchMock).toHaveBeenCalledTimes(5);
    });
  });
});

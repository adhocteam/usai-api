# USAi API Node.js Client

**BETA PROJECT DISCLAIMER**: This is an open-source, community-developed client library for the USAi.gov API. It has not been tested with live USAi.gov API endpoints, as those are only available to authorized government agencies. This project is provided as-is for government agencies to adapt and use.

**NOT A GOVERNMENT PROJECT**: This is not an official government project. It is an open-source implementation designed to help federal agencies and approved partners integrate with the USAi.gov API service.

A Node.js client library for the USAi.gov API - Government AI service with OpenAI-compatible interface supporting Claude, Llama, Gemini and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Project Status](#project-status)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Available Models](#available-models)
- [API Reference](#api-reference)
  - [Chat Completions](#chat-completions)
  - [Embeddings](#embeddings)
  - [Models](#models)
- [Advanced Features](#advanced-features)
  - [Document Processing](#document-processing)
  - [Image Analysis](#image-analysis)
  - [Enhanced Embeddings](#enhanced-embeddings)
  - [File Encoding Utilities](#file-encoding-utilities)
- [Image Support](#image-support)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Rate Limiting](#rate-limiting)
- [Government Considerations](#government-considerations)
- [Contributing](CONTRIBUTING.MD)
- [License](#license)
- [Support](#support)

## Features

- Government-ready: Designed for federal agencies and approved partners (untested with live API)
- OpenAI-compatible: Familiar API structure for easy migration
- Multi-model support: Claude Haiku 3.5, Claude Sonnet 3.7, Meta Llama 3.2, Gemini 2.0 Flash
- Embeddings: Cohere English v3 for RAG and semantic search
- Secure: Bearer token authentication with government-grade security patterns
- Modern: Full TypeScript support with ESM and CommonJS compatibility
- Streaming: Support for real-time response streaming
- Robust: Built-in retry logic, rate limiting, and comprehensive error handling
- Beta Status: Community-developed, seeking government testing and feedback

## Installation

```bash
npm install usai-api
```

## Project Status

This is a beta/community project with the following important considerations:

- Untested with Live API: This library has not been tested against actual USAi.gov API endpoints, as those require government authorization
- Government Use: Intended for federal agencies and approved partners who have access to USAi.gov API credentials
- Community Developed: Built by the open-source community based on available documentation
- Seeking Validation: We welcome government agencies to test and provide feedback
- Based on Documentation: Implementation follows the official Python examples and API documentation

### For Government Agencies

If you have access to USAi.gov API credentials and would like to test this library:
1. Install and test the library with your endpoints
2. Report any issues or needed adjustments
3. Contribute improvements back to the community

## Quick Start

```javascript
import { USAiAPI } from 'usai-api';

const client = new USAiAPI({
  apiKey: 'your-government-api-key',
  baseUrl: 'https://your-agency-endpoint.usai.gov'
});

// Simple text completion
const response = await client.complete(
  'claude-3-5-haiku',
  'Explain the federal budget process in simple terms.'
);

console.log(response);
```

## Authentication

API keys are agency-specific and require government authorization. Contact your IT administrator or the USAi.gov team for access credentials.

```javascript
const client = new USAiAPI({
  apiKey: process.env.USAI_API_KEY,
  baseUrl: process.env.USAI_BASE_URL,
  timeout: 30000,      // Optional: request timeout in ms
  maxRetries: 3,       // Optional: max retry attempts
  retryDelay: 1000     // Optional: initial retry delay in ms
});
```

## Available Models

### Text Generation
- `claude-3-5-haiku` - Fast, efficient responses
- `claude-3-5-sonnet` - Balanced performance and capability
- `llama-3-2` - Meta's latest open-source model
- `gemini-2-0-flash` - Google's fastest model

### Embeddings
- `cohere-english-v3` - High-quality English text embeddings

## API Reference

### Chat Completions

#### Basic Usage
```javascript
const response = await client.createChatCompletion({
  model: 'claude-3-5-haiku',
  messages: [
    { role: 'system', content: 'You are a helpful government assistant.' },
    { role: 'user', content: 'What are the steps to file a FOIA request?' }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(response.choices[0].message.content);
```

#### Streaming Responses
```javascript
const stream = await client.createChatCompletionStream({
  model: 'claude-3-5-haiku',
  messages: [
    { role: 'user', content: 'Explain the three branches of government.' }
  ],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

#### Convenience Methods
```javascript
// Simple completion
const result = await client.complete(
  'claude-3-5-haiku',
  'What is the role of the EPA?',
  {
    systemPrompt: 'You are an expert on federal agencies.',
    temperature: 0.5,
    maxTokens: 300
  }
);

// Streaming completion
for await (const chunk of client.completeStream(
  'claude-3-5-haiku',
  'Describe the legislative process.'
)) {
  process.stdout.write(chunk);
}
```

### Embeddings

```javascript
const embeddings = await client.createEmbedding({
  model: 'cohere-english-v3',
  input: [
    'Federal acquisition regulations',
    'Government contracting procedures',
    'Procurement compliance requirements'
  ]
});

console.log(embeddings.data[0].embedding); // Array of numbers
```

### Models

```javascript
const models = await client.getModels();
console.log(models.data.map(m => m.id));
```

## Advanced Features

### Document Processing

Process PDFs and government documents directly:

```javascript
// Analyze a government PDF report
const analysis = await client.analyzeDocument(
  'gemini-2.0-flash',
  'path/to/federal-report.pdf',
  'Summarize the key policy recommendations in this report.',
  {
    systemPrompt: 'You are a government policy analyst.',
    temperature: 0.3,
    maxTokens: 500
  }
);
```

### Image Analysis

Analyze government forms, seals, or documents:

```javascript
// Analyze a government seal or document image
const imageAnalysis = await client.analyzeImage(
  'gemini-2.0-flash',
  'path/to/government-seal.jpg',
  'Identify this government seal and its associated agency.',
  {
    detail: 'high',
    temperature: 0.2
  }
);
```

### Enhanced Embeddings

Create embeddings optimized for specific use cases:

```javascript
// Embeddings for document clustering
const clusteringEmbeddings = await client.createEmbedding({
  model: 'cohere-english-v3',
  input: ['Federal regulation text...', 'Policy document...'],
  input_type: 'clustering',
  encoding_format: 'float'
});

// Embeddings for search queries
const searchEmbedding = await client.createEmbedding({
  model: 'cohere-english-v3',
  input: 'How do I comply with federal regulations?',
  input_type: 'search_query'
});
```

### File Encoding Utilities

Static utility methods for encoding files:

```javascript
// Encode different file types
const imageUri = USAiAPI.encodeImageAsDataUri('document.jpg');
const pdfUri = USAiAPI.encodePdfAsDataUri('report.pdf');
const fileUri = USAiAPI.encodeFileAsDataUri('data.csv', 'text/csv');

// Use in multimodal requests
const response = await client.createChatCompletion({
  model: 'gemini-2.0-flash',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Analyze this document:' },
      {
        type: 'file',
        file_name: 'report.pdf',
        file: { file_data: pdfUri }
      }
    ]
  }]
});
```

## Image Support

Some models support image inputs:

```javascript
const response = await client.createChatCompletion({
  model: 'claude-3-5-sonnet',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What do you see in this document?' },
        {
          type: 'image_url',
          image_url: {
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...',
            detail: 'high'
          }
        }
      ]
    }
  ]
});
```

## Error Handling

The library provides specific error classes for different scenarios:

```javascript
import { 
  USAiAPIError, 
  USAiRateLimitError, 
  USAiAuthenticationError 
} from 'usai-api';

try {
  const response = await client.complete('claude-3-5-haiku', 'Hello');
} catch (error) {
  if (error instanceof USAiRateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter} seconds`);
  } else if (error instanceof USAiAuthenticationError) {
    console.log('Invalid API key or authentication failed');
  } else if (error instanceof USAiAPIError) {
    console.log(`API Error: ${error.message} (${error.type})`);
  }
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { USAiAPI, ChatCompletionRequest, ChatCompletionResponse } from 'usai-api';

const client = new USAiAPI({
  apiKey: process.env.USAI_API_KEY!,
  baseUrl: process.env.USAI_BASE_URL!
});

const request: ChatCompletionRequest = {
  model: 'claude-3-5-haiku',
  messages: [
    { role: 'user', content: 'Hello' }
  ],
  temperature: 0.7
};

const response: ChatCompletionResponse = await client.createChatCompletion(request);
```

## Rate Limiting

The client automatically handles rate limiting with exponential backoff:

```javascript
// Rate limit information is available in errors
try {
  await client.complete('claude-3-5-haiku', 'Hello');
} catch (error) {
  if (error instanceof USAiRateLimitError) {
    console.log(`Retry after: ${error.retryAfter} seconds`);
  }
}
```

## Government Considerations

- Security: Designed for TLS encryption and secure communications
- Compliance: Built with FedRAMP hosting patterns in mind
- Audit: Includes comprehensive error handling and logging capabilities
- Guardrails: Designed to work with model provider guardrails
- Access: Intended for federal agencies and approved partners with USAi.gov access
- Disclaimer: This is not an official government library - agencies should review and test before production use

## License

MIT License - see [LICENSE file](LICENSE) for details.

## Support

### Community Support
- GitHub Discussions: Ask questions and share experiences
- GitHub Issues: Report bugs and request features
- Documentation: Check examples and API reference in this repository

### Official USAi.gov Support
For official USAi.gov API support and credentials:
- Email: support@usai.gov
- Documentation: https://docs.usai.gov
- Service Desk: https://servicedesk.usai.gov

### Getting USAi.gov API Access
This library requires valid USAi.gov API credentials. To obtain access:
1. Contact your agency's IT administrator
2. Follow your organization's process for requesting external API access
3. Apply through official USAi.gov channels

---

**Important Disclaimer**: This is an open-source, community-maintained client library for the USAi.gov API. It is not officially endorsed by or affiliated with the USAi.gov team. API access requires separate government authorization and valid credentials.

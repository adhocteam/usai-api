# USAi API Node.js Client

[![CI/CD Pipeline](https://github.com/adhocteam/usai-api/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/adhocteam/usai-api/actions/workflows/ci-cd.yml)
[![Security Monitoring](https://github.com/adhocteam/usai-api/actions/workflows/security.yml/badge.svg)](https://github.com/adhocteam/usai-api/actions/workflows/security.yml)

**BETA PROJECT DISCLAIMER**: This is an open-source, community-developed client library for the USAi.gov API. It has not been tested with live USAi.gov API endpoints, as those are only available to authorized government agencies. This project is provided as-is for government agencies to adapt and use.

**NOT A GOVERNMENT PROJECT**: This is not an official government project. It is an open-source implementation designed to help federal agencies and approved partners integrate with the USAi.gov API service.

A Node.js client library for the USAi.gov API - Government AI service with OpenAI-compatible interface supporting Claude, Gemini, Llama, GPT, xAI and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Project Status](#project-status)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Available Models](#available-models)
- [API Reference](#api-reference)
  - [Chat Completions](#chat-completions)
  - [Tool Calling](#tool-calling)
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
- [Security & Dependency Management](#security--dependency-management)
- [Contributing](CONTRIBUTING.MD)
- [License](#license)
- [Support](#support)

## Features

- Government-ready: Designed for federal agencies and approved partners (untested with live API)
- OpenAI-compatible: Familiar API structure for easy migration
- Multi-model support: Anthropic Claude, Google Gemini, Meta Llama, OpenAI GPT, and xAI models
- Embeddings: Cohere English v3 for RAG and semantic search
- Tool calling: OpenAI-compatible function/tool calling
- Secure: Bearer token authentication with government-grade security patterns
- Modern: Full TypeScript support with ESM and CommonJS compatibility
- Streaming: Support for real-time response streaming
- Robust: Built-in retry logic, optional client-side rate limiting, and comprehensive error handling (including budget limits and content filtering)
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
  'claude_4_5_haiku',
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
  retryDelay: 1000,    // Optional: initial retry delay in ms
  throttleRequests: false // Optional: stay within documented rate limits client-side
});
```

## Available Models

Model availability changes over time, and USAi may remove models that no longer meet its standards. The [USAi API documentation](https://www.usai.gov/api-documentation/) lists models by display name only. The identifiers below follow the formats used in the official examples (for example `gemini-2.5-flash`, `claude_4_5_sonnet`, `llama_4_maverick`, `cohere_english_v3`) and have not been verified against a live endpoint. Call `client.getModels()` to get the authoritative identifiers available to your API key.

### Text Generation

#### Anthropic Claude Models
- `claude_4_5_haiku` - Claude Haiku 4.5
- `claude_4_5_sonnet` - Claude Sonnet 4.5
- `claude_4_6_sonnet` - Claude Sonnet 4.6
- `claude_5_sonnet` - Claude Sonnet 5
- `claude_4_5_opus` - Claude Opus 4.5
- `claude_4_7_opus` - Claude Opus 4.7
- `claude_4_8_opus` - Claude Opus 4.8
- `claude_5_opus` - Claude Opus 5

#### Google Gemini Models
- `gemini-2.5-flash` - Gemini 2.5 Flash
- `gemini-2.5-pro` - Gemini 2.5 Pro
- `gemini-3.5-flash` - Gemini 3.5 Flash
- `gemini-3.7-flash` - Gemini 3.7 Flash
- `gemini-3.8-flash` - Gemini 3.8 Flash

#### Meta Llama Models
- `llama3211b` - Llama 3.2 11B
- `llama_4_maverick` - Llama 4 Maverick

#### OpenAI Models
- `gpt_5_2` - GPT 5.2
- `gpt_5_4` - GPT 5.4
- `gpt_5_5` - GPT 5.5
- `gpt_5_6_sol` - GPT 5.6 Sol
- `gpt_5_6_terra` - GPT 5.6 Terra
- `gpt_5_6_luna` - GPT 5.6 Luna
- `gpt_6_astra` - GPT 6 Astra

#### xAI Models
xAI models are available. Use `client.getModels()` to find their identifiers.

### Embeddings
- `cohere_english_v3` - High-quality English text embeddings

### Using Model Constants

For type safety and autocomplete, use the exported model constants:

```javascript
import { USAiAPI, USAiModels, EmbeddingInputTypes } from 'usai-api';

// Use model constants for type safety
const response = await client.complete(
  USAiModels.CLAUDE_4_5_SONNET,
  'Explain federal procurement regulations.'
);

// Use embedding input type constants
const embeddings = await client.createEmbedding({
  model: USAiModels.COHERE_ENGLISH_V3,
  input: 'Federal acquisition text...',
  input_type: EmbeddingInputTypes.SEARCH_DOCUMENT
});
```

## API Reference

### Chat Completions

#### Basic Usage
```javascript
const response = await client.createChatCompletion({
  model: 'claude_4_5_haiku',
  messages: [
    { role: 'system', content: 'You are a helpful government assistant.' },
    { role: 'user', content: 'What are the steps to file a FOIA request?' }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(response.choices[0].message.content);
```

Supported parameters per the USAi documentation: `model`, `messages`, `max_tokens`, `temperature` (0.0-1.0; values outside this range are rejected client-side), `top_p`, `stream`, `tools`, and `tool_choice`. Not every OpenAI Chat Completions feature is available for every model.

#### Streaming Responses
```javascript
const stream = await client.createChatCompletionStream({
  model: 'claude_4_5_haiku',
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
  'claude_4_5_haiku',
  'What is the role of the EPA?',
  {
    systemPrompt: 'You are an expert on federal agencies.',
    temperature: 0.5,
    maxTokens: 300
  }
);

// Streaming completion
for await (const chunk of client.completeStream(
  'claude_4_5_haiku',
  'Describe the legislative process.'
)) {
  process.stdout.write(chunk);
}
```

#### Tool Calling

Give the model functions it can ask you to call, then send the results back:

```javascript
const tools = [{
  type: 'function',
  function: {
    name: 'lookup_agency',
    description: 'Look up details about a federal agency by acronym',
    parameters: {
      type: 'object',
      properties: { acronym: { type: 'string' } },
      required: ['acronym']
    }
  }
}];

const messages = [{ role: 'user', content: 'What does GSA do?' }];

const first = await client.createChatCompletion({
  model: USAiModels.GEMINI_2_5_FLASH,
  messages,
  tools
});

const assistantMessage = first.choices[0].message;
if (assistantMessage.tool_calls) {
  messages.push(assistantMessage);
  for (const call of assistantMessage.tool_calls) {
    const args = JSON.parse(call.function.arguments);
    const result = await lookupAgency(args.acronym); // your implementation
    messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
  }

  const final = await client.createChatCompletion({ model: USAiModels.GEMINI_2_5_FLASH, messages, tools });
  console.log(final.choices[0].message.content);
}
```

### Embeddings

```javascript
const embeddings = await client.createEmbedding({
  model: 'cohere_english_v3',
  input: [
    'Federal acquisition regulations',
    'Government contracting procedures',
    'Procurement compliance requirements'
  ]
});

console.log(embeddings.data[0].embedding); // Array of numbers
console.log(embeddings.usage.prompt_tokens); // camelCase `promptTokens` is also available
```

Optional parameters include `input_type` (see below), `dimensions` (only supported by some models), and `encodingFormat`.

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
  'gemini-2.5-flash',
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
  'gemini-2.5-flash',
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
  model: 'cohere_english_v3',
  input: ['Federal regulation text...', 'Policy document...'],
  input_type: 'clustering',
  encodingFormat: 'float'
});

// Embeddings for search queries
const searchEmbedding = await client.createEmbedding({
  model: 'cohere_english_v3',
  input: 'How do I comply with federal regulations?',
  input_type: 'search_query'
});

// Embeddings for semantic similarity comparisons
const similarityEmbedding = await client.createEmbedding({
  model: 'cohere_english_v3',
  input: ['Document A text...', 'Document B text...'],
  input_type: 'semantic_similarity'
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
  model: 'gemini-2.5-flash',
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
  model: 'claude_4_5_sonnet',
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
  USAiBudgetLimitError,
  USAiContentFilterError,
  USAiAuthenticationError 
} from 'usai-api';

try {
  const response = await client.complete('claude_4_5_haiku', 'Hello');
} catch (error) {
  if (error instanceof USAiBudgetLimitError) {
    console.log('Weekly budget limit reached; budgets reset each Monday');
  } else if (error instanceof USAiRateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter} seconds`);
  } else if (error instanceof USAiContentFilterError) {
    console.log('Request or response blocked by content filtering');
  } else if (error instanceof USAiAuthenticationError) {
    console.log('Invalid API key or authentication failed');
  } else if (error instanceof USAiAPIError) {
    console.log(`API Error: ${error.message} (${error.type})`);
  }
}
```

- `USAiBudgetLimitError` (a subclass of `USAiRateLimitError`) is raised when your agency's weekly per-person cost limit is reached (HTTP 429, "budget limit reached for this billing cycle"). It is not retried. Budgets run Monday through Sunday and apply across all of your API keys.
- `USAiContentFilterError` is raised when platform guardrails (Azure DefaultV2 content filtering on OpenAI and xAI models) block content. Non-streaming requests receive HTTP 400. For streaming requests, the error is thrown from the stream iterator when the error chunk arrives.
- Client errors (4xx) are not retried. Transient rate limits, server errors (5xx), and network failures are retried with exponential backoff.

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { USAiAPI, ChatCompletionRequest, ChatCompletionResponse } from 'usai-api';

const client = new USAiAPI({
  apiKey: process.env.USAI_API_KEY!,
  baseUrl: process.env.USAI_BASE_URL!
});

const request: ChatCompletionRequest = {
  model: 'claude_4_5_haiku',
  messages: [
    { role: 'user', content: 'Hello' }
  ],
  temperature: 0.7
};

const response: ChatCompletionResponse = await client.createChatCompletion(request);
```

## Rate Limiting

USAi enforces the following per-API-key limits:

| Endpoint | Limit |
|----------|-------|
| Models | 3 calls / second |
| Chat completions | 3 calls / second |
| Embeddings | 100 calls / second |

Exceeding a limit returns HTTP 429. The client retries these with exponential backoff, honoring `Retry-After` when present. To avoid hitting the limits in the first place, enable client-side throttling:

```javascript
const client = new USAiAPI({
  apiKey: process.env.USAI_API_KEY,
  baseUrl: process.env.USAI_BASE_URL,
  throttleRequests: true
});
```

Throttling is tracked per client instance. Share a single client across your application for it to be effective. The documented limits are also exported as `USAiRateLimits`.

```javascript
try {
  await client.complete('claude_4_5_haiku', 'Hello');
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
- Guardrails: OpenAI and xAI models use Azure DefaultV2 content filtering. Google, Anthropic, and Meta models rely only on provider guardrails, so add your own system prompts and safeguards as needed (see the [USAi best practices](https://www.usai.gov/api-documentation/#best-practices))
- Access: Intended for federal agencies and approved partners with USAi.gov access
- Disclaimer: This is not an official government library - agencies should review and test before production use

## Security & Dependency Management

This project includes comprehensive automated security and dependency management workflows designed specifically for government agency requirements.

### Automated Security Monitoring

**Daily Security Scans**
- Vulnerability detection using npm audit and industry-standard tools
- License compliance verification for government use
- Secret detection to prevent credential leaks
- Dependency supply chain analysis
- Government-specific security pattern scanning

**Critical Issue Alerting**
- [Immediate notifications for critical vulnerabilities](https://github.com/adhocteam/usai-api/issues/2)
- Automated workflow failures for high-risk issues
- Detailed security reports with remediation guidance
- Integration with government security review processes

### Automated Dependency Management

**Weekly Dependency Updates**
- Automated scanning for available package updates
- Security-focused update prioritization
- Automatic pull request creation with government review checklists
- Breaking change analysis and impact assessment

**Supply Chain Security**
- Deep dependency tree analysis
- Package publisher verification
- Integrity checking and signature validation
- Risk assessment for third-party dependencies

### Government-Specific Features

**Compliance Integration**
- [ATO (Authority to Operate) documentation support](https://github.com/adhocteam/usai-api/issues/3)
- FedRAMP security standard alignment
- Federal acquisition regulation compliance
- Agency-specific security policy integration

**Review & Approval Workflows**
- Government security team notification
- Standardized review checklists
- Audit trail maintenance
- Risk assessment documentation

### Workflow Files

The security and dependency management features are implemented in:
- `.github/workflows/ci-cd.yml` - Core CI/CD with security scanning
- `.github/workflows/security.yml` - Daily security monitoring
- `.github/workflows/dependency-management.yml` - Weekly dependency updates

For detailed workflow documentation, see [WORKFLOWS.md](WORKFLOWS.md).

### Agency Implementation

Government agencies can customize these workflows by:
1. Configuring agency-specific security tokens (Snyk, etc.)
2. Setting up notification channels for security alerts
3. Adapting review processes to match internal policies
4. Integrating with existing security monitoring systems

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
- Documentation: https://www.usai.gov/api-documentation/
- Service Desk: https://servicedesk.usai.gov

### Getting USAi.gov API Access
This library requires valid USAi.gov API credentials. To obtain access:
1. Contact your agency's IT administrator
2. Follow your organization's process for requesting external API access
3. Apply through official USAi.gov channels

---

**Important Disclaimer**: This is an open-source, community-maintained client library for the USAi.gov API. It is not officially endorsed by or affiliated with the USAi.gov team. API access requires separate government authorization and valid credentials.

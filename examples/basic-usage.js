import { USAiAPI } from '../src/index.js';

// Example usage of the USAi API client
async function main() {
  // Initialize the client
  const client = new USAiAPI({
    apiKey: process.env.USAI_API_KEY || 'your-api-key',
    baseUrl: process.env.USAI_BASE_URL || 'https://your-agency.usai.gov'
  });

  try {
    // 1. List available models
    console.log('🤖 Available Models:');
    const models = await client.getModels();
    models.data.forEach(model => {
      console.log(`  - ${model.id} (${model.owned_by})`);
    });

    // 2. Simple text completion
    console.log('\n💬 Simple Completion:');
    const simpleResponse = await client.complete(
      'claude-3-5-haiku',
      'Explain the three branches of the US government in 2 sentences.',
      {
        systemPrompt: 'You are a helpful government education assistant.',
        temperature: 0.3,
        maxTokens: 200
      }
    );
    console.log(simpleResponse);

    // 3. Chat completion with conversation
    console.log('\n🗣️ Chat Completion:');
    const chatResponse = await client.createChatCompletion({
      model: 'claude-3-5-haiku',
      messages: [
        {
          role: 'system',
          content: 'You are an expert on federal procurement processes.'
        },
        {
          role: 'user',
          content: 'What are the key steps in the federal acquisition process?'
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    });
    console.log(chatResponse.choices[0].message.content);

    // 4. Streaming completion
    console.log('\n🌊 Streaming Completion:');
    console.log('Response: ');
    for await (const chunk of client.completeStream(
      'claude-3-5-haiku',
      'Write a brief overview of the Freedom of Information Act (FOIA).',
      {
        systemPrompt: 'You are a government transparency expert.',
        temperature: 0.4,
        maxTokens: 250
      }
    )) {
      process.stdout.write(chunk);
    }
    console.log('\n');

    // 5. Create embeddings for semantic search
    console.log('\n🔍 Creating Embeddings:');
    const embeddingResponse = await client.createEmbedding({
      model: 'cohere-english-v3',
      input: [
        'Federal acquisition regulations and procurement policies',
        'Government contracting and vendor management',
        'Compliance requirements for federal suppliers'
      ]
    });
    
    console.log('Embeddings created:');
    embeddingResponse.data.forEach((embedding, index) => {
      console.log(`  Document ${index + 1}: ${embedding.embedding.length} dimensions`);
    });

    // 6. Advanced chat with image (if supported by model)
    console.log('\n🖼️ Chat with Image Support:');
    try {
      const imageResponse = await client.createChatCompletion({
        model: 'claude-3-5-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'What type of government document is this?' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+mtUrCOl0c9voSRnz2JVvILPLGjDgH5Qk0Xz9Y7EG5OJ5Lq7aPCJedT2EEBPI3IJ4LMFEoSJdvLGnKKXwE9oUOY5v4sIFOTgGjl5Z4MPGQKO8Q==',
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 150
      });
      
      const imageContent = imageResponse.choices[0].message.content;
      if (typeof imageContent === 'string') {
        console.log(imageContent);
      }
    } catch (error) {
      console.log('Image analysis not available for this model or configuration');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Handle specific error types
    if (error.name === 'USAiRateLimitError') {
      console.log(`Rate limited. Retry after: ${error.retryAfter} seconds`);
    } else if (error.name === 'USAiAuthenticationError') {
      console.log('Authentication failed. Please check your API key.');
    }
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

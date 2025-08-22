import { USAiAPI } from '../src/index.js';

async function embeddingsExample() {
  const client = new USAiAPI({
    apiKey: process.env.USAI_API_KEY || 'your-api-key',
    baseUrl: process.env.USAI_BASE_URL || 'https://your-agency.usai.gov'
  });

  // Example documents for a government knowledge base
  const documents = [
    "The Federal Acquisition Regulation (FAR) is the primary regulation for use by all federal executive agencies in their acquisition of supplies and services with appropriated funds.",
    "A FOIA request is a request for records made under the Freedom of Information Act. Federal agencies are required to disclose any information requested under FOIA unless it falls under one of nine exemptions.",
    "The General Services Administration (GSA) manages and supports the basic functioning of federal agencies through supplies, communications, and transportation services.",
    "Small Business Administration (SBA) provides support to entrepreneurs and small businesses through loans, grants, and educational programs.",
    "The Office of Management and Budget (OMB) assists the President in oversight of federal departments and agencies."
  ];

  try {
    console.log('🔍 Creating embeddings for government documents...\n');

    // Create embeddings for all documents
    const embeddingResponse = await client.createEmbedding({
      model: 'cohere-english-v3',
      input: documents
    });

    console.log(`✅ Created ${embeddingResponse.data.length} embeddings`);
    console.log(`📊 Embedding dimensions: ${embeddingResponse.data[0].embedding.length}`);
    console.log(`🎯 Token usage: ${embeddingResponse.usage.total_tokens} tokens\n`);

    // Simulate a user query
    const userQuery = "How do I request government information?";
    console.log(`❓ User Query: "${userQuery}"\n`);

    // Create embedding for the query
    const queryEmbedding = await client.createEmbedding({
      model: 'cohere-english-v3',
      input: userQuery
    });

    // Calculate cosine similarity (simplified example)
    const similarities = embeddingResponse.data.map((docEmbedding, index) => {
      const similarity = cosineSimilarity(
        queryEmbedding.data[0].embedding,
        docEmbedding.embedding
      );
      return {
        index,
        document: documents[index],
        similarity: similarity
      };
    });

    // Sort by similarity and show top results
    similarities.sort((a, b) => b.similarity - a.similarity);

    console.log('🎯 Most relevant documents:');
    similarities.slice(0, 3).forEach((result, rank) => {
      console.log(`\n${rank + 1}. Similarity: ${result.similarity.toFixed(4)}`);
      console.log(`   Document: ${result.document}`);
    });

  } catch (error) {
    console.error('❌ Error creating embeddings:', error.message);
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Run the example
if (require.main === module) {
  embeddingsExample().catch(console.error);
}

import { USAiAPI } from '../src/index.js';
import fs from 'fs';

/**
 * Enhanced USAi API Examples
 * Demonstrating advanced features discovered from the Python documentation
 */

async function demonstrateEnhancedFeatures() {
  // Initialize client
  const client = new USAiAPI({
    apiKey: process.env.USAI_API_KEY || 'your-api-key',
    baseUrl: process.env.USAI_BASE_URL || 'https://your-agency.usai.gov'
  });

  console.log('🚀 Enhanced USAi API Features Demo\n');

  try {
    // 1. Document Analysis (following Python example pattern)
    console.log('📄 Document Analysis Example:');
    console.log('Processing government PDF document...\n');

    // Example of document analysis (would work with real file)
    try {
      const documentSummary = await client.analyzeDocument(
        'gemini-2.0-flash',
        'path/to/government-report.pdf',
        'Please analyze this government document and provide a comprehensive summary including key policies, dates, and action items.',
        {
          systemPrompt: 'You are an expert government policy analyst. Provide detailed, accurate analysis.',
          fileName: 'Federal_Policy_Report.pdf',
          temperature: 0.3,
          maxTokens: 500
        }
      );
      console.log('Summary:', documentSummary);
    } catch (error) {
      console.log('Note: Document analysis requires actual PDF file');
      console.log('Example usage: client.analyzeDocument(model, pdfPath, prompt, options)');
    }

    // 2. Image Analysis (following Python example pattern)
    console.log('\n🖼️ Image Analysis Example:');
    console.log('Analyzing government seal or document...\n');

    try {
      const imageAnalysis = await client.analyzeImage(
        'gemini-2.0-flash',
        'path/to/government-seal.jpg',
        'What type of government document or seal is this? Please identify any key elements, official markings, or agency identifiers.',
        {
          systemPrompt: 'You are an expert at analyzing government documents and official seals.',
          detail: 'high',
          temperature: 0.2,
          maxTokens: 300
        }
      );
      console.log('Analysis:', imageAnalysis);
    } catch (error) {
      console.log('Note: Image analysis requires actual image file');
      console.log('Example usage: client.analyzeImage(model, imagePath, prompt, options)');
    }

    // 3. Enhanced Embeddings with input_type (following Python example)
    console.log('\n🔍 Enhanced Embeddings Example:');
    
    const documentTexts = [
      "Federal Acquisition Regulation (FAR) compliance requirements for government contractors",
      "Freedom of Information Act (FOIA) request processing procedures and exemptions",
      "Small Business Administration (SBA) loan programs and eligibility criteria",
      "Environmental Protection Agency (EPA) regulatory enforcement guidelines"
    ];

    // Create embeddings for clustering (like Python example)
    const clusteringEmbeddings = await client.createEmbedding({
      model: 'cohere-english-v3',
      input: documentTexts,
      input_type: 'clustering',
      encoding_format: 'float'
    });

    console.log(`✅ Created ${clusteringEmbeddings.data.length} clustering embeddings`);
    console.log(`📊 Dimensions: ${clusteringEmbeddings.data[0].embedding.length}`);

    // Create query embedding for semantic search
    const searchQuery = "How do I ensure my business complies with federal regulations?";
    const queryEmbedding = await client.createEmbedding({
      model: 'cohere-english-v3',
      input: searchQuery,
      input_type: 'search_query',
      encoding_format: 'float'
    });

    console.log(`🔎 Query embedding created for: "${searchQuery}"`);

    // Calculate semantic similarities
    const similarities = clusteringEmbeddings.data.map((docEmbedding, index) => {
      const similarity = cosineSimilarity(
        queryEmbedding.data[0].embedding,
        docEmbedding.embedding
      );
      return {
        index,
        document: documentTexts[index],
        similarity: similarity
      };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);

    console.log('\n🎯 Most relevant documents:');
    similarities.slice(0, 2).forEach((result, rank) => {
      console.log(`${rank + 1}. Similarity: ${result.similarity.toFixed(4)}`);
      console.log(`   ${result.document}\n`);
    });

    // 4. Utility Methods Demo
    console.log('🛠️ Utility Methods Example:');
    
    // Show how to use static utility methods
    try {
      // These would work with actual files
      console.log('Static utility methods available:');
      console.log('- USAiAPI.encodeImageAsDataUri(imagePath, mimeType?)');
      console.log('- USAiAPI.encodePdfAsDataUri(pdfPath)');
      console.log('- USAiAPI.encodeFileAsDataUri(filePath, mimeType?)');
      
      // Example of manual encoding for custom use cases
      if (fs.existsSync('sample.txt')) {
        const encoded = USAiAPI.encodeFileAsDataUri('sample.txt');
        console.log('✅ File encoded successfully');
      }
    } catch (error) {
      console.log('Note: Utility methods require actual files to encode');
    }

    // 5. Multi-modal Chat with File Content (Python example pattern)
    console.log('\n💬 Multi-modal Chat Example:');
    
    const multiModalResponse = await client.createChatCompletion({
      model: 'gemini-2.0-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a government compliance expert. Analyze documents and provide actionable guidance.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Based on this document, what are the key compliance requirements for federal contractors?'
            }
            // In real usage, you would add file content here:
            // {
            //   type: 'file',
            //   file_name: 'compliance_guide.pdf',
            //   file: {
            //     file_data: USAiAPI.encodePdfAsDataUri('path/to/compliance_guide.pdf')
            //   }
            // }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    console.log('Multi-modal response structure ready');
    console.log('Note: Add file content using USAiAPI utility methods');

    console.log('\n🎉 Enhanced features demonstration complete!');
    console.log('\nNew capabilities added:');
    console.log('✅ Document processing with file type support');
    console.log('✅ Enhanced embeddings with input_type parameter');
    console.log('✅ Utility methods for file encoding');
    console.log('✅ Convenience methods for document/image analysis');
    console.log('✅ Government-specific use case examples');

  } catch (error) {
    console.error('❌ Error during demonstration:', error.message);
  }
}

// Helper function for cosine similarity (from Python example)
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Run the demonstration
if (require.main === module) {
  demonstrateEnhancedFeatures().catch(console.error);
}

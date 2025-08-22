# USAi API Examples

This directory contains comprehensive examples demonstrating how to use the USAi API Node.js client library. These examples are designed to help government agencies and developers understand the full capabilities of the library.

## 📑 Available Examples

### 🚀 [basic-usage.js](./basic-usage.js)
**Purpose**: Complete introduction to core USAi API functionality  
**Best For**: First-time users, basic integration testing  

**What it demonstrates**:
- ✅ Client initialization and authentication
- ✅ Listing available AI models
- ✅ Simple text completion
- ✅ Chat completions with conversation history
- ✅ Streaming responses for real-time output
- ✅ Creating embeddings for semantic search
- ✅ Image analysis with government documents
- ✅ Error handling patterns

**Government Use Cases**:
- Policy Q&A systems
- Document summarization
- Basic AI integration testing

---

### 🔍 [embeddings.js](./embeddings.js)
**Purpose**: Advanced semantic search and document clustering  
**Best For**: Building knowledge bases, document repositories  

**What it demonstrates**:
- ✅ Creating embeddings for government documents
- ✅ Semantic similarity calculations
- ✅ Document clustering and organization
- ✅ Query-based document retrieval
- ✅ Cosine similarity implementation

**Government Use Cases**:
- Federal regulation search systems
- Policy document organization
- FOIA request processing
- Compliance document clustering
- Knowledge management systems

---

### ⚡ [enhanced-features.js](./enhanced-features.js)
**Purpose**: Advanced features discovered from Python documentation  
**Best For**: Agencies needing document/image processing  

**What it demonstrates**:
- ✅ PDF document analysis and processing
- ✅ Government seal and form image recognition
- ✅ Enhanced embeddings with `input_type` parameters
- ✅ File encoding utilities (`encodeImageAsDataUri`, `encodePdfAsDataUri`)
- ✅ Multi-modal chat with file attachments
- ✅ Convenience methods for common tasks
- ✅ Model capability comparisons

**Government Use Cases**:
- Form processing automation
- Government document analysis
- Seal and logo verification
- Multi-format document handling
- Visual document inspection

---

### 📊 [comprehensive-example.ipynb](./comprehensive-example.ipynb)
**Purpose**: Interactive Jupyter notebook with complete feature walkthrough  
**Best For**: Learning, experimentation, documentation  

**What it demonstrates**:
- ✅ Step-by-step tutorial format
- ✅ All library features with explanations
- ✅ Government-specific examples and scenarios
- ✅ Interactive code cells for testing
- ✅ Visual outputs and results
- ✅ Best practices and patterns
- ✅ Error handling strategies
- ✅ Production deployment considerations

**Government Use Cases**:
- Training new developers
- API capability demonstrations
- Proof-of-concept development
- Integration planning sessions

## 🏛️ Government-Specific Scenarios

### Federal Acquisition Regulation (FAR) Processing
```javascript
// From embeddings.js - organize procurement documents
const procurementDocs = [
  "Federal Acquisition Regulation compliance requirements",
  "Contractor eligibility and registration procedures",
  "Bid evaluation and award processes"
];
```

### FOIA Request Processing
```javascript
// From basic-usage.js - automate FOIA responses
const foiaResponse = await client.complete(
  'claude-3-5-haiku',
  'Explain the process for filing a FOIA request'
);
```

### Document Analysis Pipeline
```javascript
// From enhanced-features.js - process government PDFs
const analysis = await client.analyzeDocument(
  'gemini-2.0-flash',
  'federal-policy-report.pdf',
  'Summarize key policy recommendations'
);
```

## 🚀 Getting Started

### Prerequisites
```bash
# Ensure you have the USAi API client installed
npm install usai-api

# Set up your environment variables
export USAI_API_KEY="your-government-api-key"
export USAI_BASE_URL="https://your-agency-endpoint.usai.gov"
```

### Running Examples

#### 1. **Basic Usage Example**
```bash
node examples/basic-usage.js
```
*Start here for your first integration*

#### 2. **Embeddings Example**
```bash
node examples/embeddings.js
```
*Perfect for semantic search projects*

#### 3. **Enhanced Features**
```bash
node examples/enhanced-features.js
```
*Advanced document and image processing*

#### 4. **Jupyter Notebook**
```bash
# Install Jupyter if you haven't already
pip install jupyter

# Start Jupyter and open the notebook
jupyter notebook examples/comprehensive-example.ipynb
```
*Interactive learning and experimentation*

## 📋 Example Comparison

| Feature | basic-usage.js | embeddings.js | enhanced-features.js | comprehensive-example.ipynb |
|---------|:-------------:|:-------------:|:-------------------:|:--------------------------:|
| **Chat Completions** | ✅ | ✅ | ✅ | ✅ |
| **Streaming** | ✅ | ❌ | ❌ | ✅ |
| **Embeddings** | ✅ | ✅ | ✅ | ✅ |
| **Image Analysis** | ✅ | ❌ | ✅ | ✅ |
| **Document Processing** | ❌ | ❌ | ✅ | ✅ |
| **File Utilities** | ❌ | ❌ | ✅ | ✅ |
| **Error Handling** | ✅ | ✅ | ✅ | ✅ |
| **Government Examples** | ✅ | ✅ | ✅ | ✅ |
| **Interactive Learning** | ❌ | ❌ | ❌ | ✅ |

## 🔒 Security Considerations

### For Government Agencies
- **API Keys**: All examples use environment variables for secure credential management
- **Data Handling**: Examples avoid including sensitive or classified information
- **File Processing**: Document examples use placeholder paths and generic content
- **Network Security**: All communications designed for TLS encryption

### Best Practices Demonstrated
- Proper error handling for government security requirements
- Secure credential management patterns
- Audit-friendly logging approaches
- Rate limiting and retry logic implementation

## ⚠️ Important Notes

### Beta Status
- These examples are based on available USAi.gov API documentation
- **Not tested with live USAi.gov endpoints** (requires government authorization)
- Government agencies with API access encouraged to test and provide feedback

### File Dependencies
- Image and document examples require actual files to function fully
- Placeholder content is used where files are not available
- Replace file paths with your actual government documents for testing

### Environment Setup
```bash
# Required environment variables
USAI_API_KEY=your-government-api-key
USAI_BASE_URL=https://your-agency-endpoint.usai.gov

# Optional configuration
USAI_TIMEOUT=30000
USAI_MAX_RETRIES=3
```

## 🤝 Contributing Examples

We welcome additional examples, especially from government agencies! 

### Needed Examples
- **Compliance automation** workflows
- **Multi-agency** integration patterns
- **Audit trail** and logging examples
- **Performance optimization** for large document sets
- **Security-focused** implementations

### Contribution Process
1. Create your example following the existing patterns
2. Add government-specific use cases and comments
3. Update this README with your example details
4. Submit a pull request with comprehensive testing notes

## 💬 Support

- **Questions about examples**: Open a GitHub Discussion
- **Bug reports**: Submit a GitHub Issue
- **Government-specific help**: See main README for USAi.gov support contacts

---

**🇺🇸 These examples are designed to help federal agencies effectively integrate AI capabilities while maintaining security and compliance standards.**

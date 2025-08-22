# AGENTS.md

This file provides context and instructions for AI coding agents working on the USAi API Node.js module - an open-source library for integrating with government AI services.

## Project Overview

The USAi API is a TypeScript/Node.js client library that provides an OpenAI-compatible interface for accessing government AI models (Claude, Llama, Gemini) through the USAi.gov platform. This is a **beta open-source project** designed for government agencies and contractors.

### Key Technologies
- **TypeScript** with strict mode
- **Node.js** (16.x, 18.x, 20.x support)
- **Jest** for testing
- **ESLint + Prettier** for code quality
- **OpenAI-compatible API** design patterns

## Setup Commands

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## Development Environment

### File Structure
- `src/` - TypeScript source code
  - `index.ts` - Main exports
  - `client.ts` - Core USAiAPI class
  - `http-client.ts` - HTTP client with retry logic
  - `types.ts` - Type definitions
  - `errors.ts` - Custom error classes
- `tests/` - Jest test files
- `examples/` - Usage examples including Jupyter notebook
- `dist/` - Built output (ESM + CommonJS)

### Build System
- **TypeScript compilation** to both ESM (`dist/esm/`) and CommonJS (`dist/cjs/`)
- **Dual package.json** approach for proper module resolution
- **Source maps** included for debugging

### Testing Strategy
- **Unit tests** for all core functionality
- **Integration tests** for API interactions
- **Error handling tests** for edge cases
- **Enhanced features tests** for government-specific functionality
- Target: **>90% code coverage**

## Code Style Guidelines

### TypeScript Standards
- **Strict mode enabled** - no `any` types
- **Explicit return types** for public methods
- **Interface-based design** over class inheritance
- **Comprehensive JSDoc** for all public APIs

### Formatting Rules
- **Prettier configuration** - 2 spaces, single quotes, no semicolons
- **ESLint rules** - TypeScript recommended + custom government rules
- **Import organization** - external imports first, then internal
- **File naming** - kebab-case for files, PascalCase for classes

### Code Patterns
```typescript
// Preferred: Interface-based design
interface USAiConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

// Preferred: Explicit error handling
async function makeRequest(): Promise<Result<T, USAiError>> {
  try {
    // Implementation
  } catch (error) {
    return new USAiError('Specific error message', error)
  }
}

// Preferred: Government-focused documentation
/**
 * Processes government documents for AI analysis
 * @param document - Document content (PDF, DOCX, TXT)
 * @param options - Processing options for compliance
 * @returns Promise<DocumentAnalysis> - Analysis results
 * @government-use Approved for federal agency use
 */
```

## Testing Instructions

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- client.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Requirements
- **All new features** must include tests
- **Edge cases** should be covered
- **Error scenarios** must be tested
- **Government compliance** features need specific tests
- **API compatibility** with OpenAI interface must be validated

### Test Categories
1. **Unit Tests** - Individual function/method testing
2. **Integration Tests** - API endpoint interactions
3. **Error Handling** - Network failures, invalid responses
4. **Government Features** - Document processing, enhanced embeddings
5. **Security Tests** - Input validation, sanitization

## Security Considerations

### Government Requirements
- **No hardcoded secrets** - use environment variables
- **Input validation** on all user data
- **Sanitization** of file uploads
- **Rate limiting** respect for government APIs
- **Audit logging** for compliance tracking

### Sensitive Data Handling
```typescript
// ✅ Correct: Environment-based configuration
const config = {
  apiKey: process.env.USAI_API_KEY,
  baseURL: process.env.USAI_BASE_URL || 'https://api.usai.gov'
}

// ❌ Wrong: Hardcoded credentials
const config = {
  apiKey: 'sk-123456789',  // NEVER do this
}
```

### Security Testing
- Run `npm audit` before commits
- Validate all file upload handling
- Test rate limiting behavior
- Ensure no sensitive data in logs

## Build and Deployment

### Build Process
```bash
# Clean previous builds
npm run clean

# Build for production
npm run build

# Verify build output
npm run build:verify

# Prepare for publishing
npm run prepublishOnly
```

### Package Publishing
- **Dual module support** (ESM + CommonJS)
- **TypeScript declarations** included
- **Source maps** for debugging
- **Government compliance** metadata in package.json

### CI/CD Integration
The project uses GitHub Actions for:
- **Multi-version testing** (Node 16, 18, 20)
- **Security scanning** (npm audit, Snyk, CodeQL)
- **Government compliance** checks
- **Automated dependency** updates

## Government-Specific Instructions

### Compliance Features
When working on government-related features:
- **Document processing** must handle classified markings
- **Embeddings** should support government data classification
- **API responses** must include compliance metadata
- **Error messages** should not leak sensitive information

### Agency Integration
- Support for **agency-specific configurations**
- **FedRAMP compliance** considerations
- **ATO documentation** generation support
- **FISMA controls** alignment

## Common Tasks

### Adding New Features
1. **Create interface** in `src/types.ts`
2. **Implement in client** (`src/client.ts`)
3. **Add comprehensive tests** in `tests/`
4. **Update examples** in `examples/`
5. **Document in README** if user-facing

### Fixing Bugs
1. **Reproduce issue** with test case
2. **Identify root cause** in codebase
3. **Implement fix** with minimal changes
4. **Verify fix** with existing tests
5. **Add regression test** to prevent recurrence

### Performance Optimization
- **Profile with Node.js** built-in profiler
- **Measure HTTP client** performance
- **Optimize TypeScript** compilation
- **Monitor memory usage** in long-running processes

## Pull Request Guidelines

### PR Title Format
```
[scope] brief description

Examples:
[client] add document processing support
[tests] improve error handling coverage
[docs] update government compliance guide
[security] fix input validation vulnerability
```

### Pre-commit Checklist
- [ ] `npm run lint` passes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run build` completes successfully
- [ ] Security scan (`npm audit`) shows no vulnerabilities
- [ ] Documentation updated for user-facing changes
- [ ] Examples updated if API changes
- [ ] Government compliance considered for new features

### Review Requirements
- **Code quality** - TypeScript best practices
- **Test coverage** - New code must be tested
- **Security review** - Government security standards
- **Performance impact** - No significant degradation
- **Documentation** - Clear and comprehensive

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
npm run clean && npm run build

# Check TypeScript errors
npm run type-check

# Verify dependencies
npm ci
```

#### Test Failures
```bash
# Run specific failing test
npm test -- --testNamePattern="failing test name"

# Debug with verbose output
npm test -- --verbose

# Check for async issues
npm test -- --detectOpenHandles
```

#### Import/Export Issues
- Verify `package.json` exports configuration
- Check TypeScript module resolution
- Ensure dual module build is working
- Test both ESM and CommonJS imports

### Performance Issues
- Use `--inspect` flag for Node.js debugging
- Profile HTTP requests with timing
- Monitor memory usage patterns
- Check for memory leaks in long tests

## Agent-Specific Notes

### Context Awareness
- This is an **open-source government project**
- **Security is paramount** - government standards apply
- **Compliance documentation** is required for changes
- **Multi-stakeholder** codebase (agencies, contractors, public)

### Development Philosophy
- **Government-first design** - agencies are primary users
- **OpenAI compatibility** - familiar interface for developers
- **Security by default** - all features assume sensitive data
- **Community-driven** - open to contributions and feedback

### When Making Changes
1. Consider **government use cases** first
2. Maintain **OpenAI API compatibility** 
3. Include **security considerations** in design
4. Document **compliance implications**
5. Test with **realistic government scenarios**

---

**Project Status:** Beta - Open Source  
**Target Users:** Government Agencies, Contractors, Public Sector  
**Security Level:** Government-ready with compliance features  
**Contribution Policy:** Community contributions welcome

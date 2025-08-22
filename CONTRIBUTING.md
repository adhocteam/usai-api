# Contributing to USAi API Node.js Client

Thank you for your interest in contributing to the USAi API Node.js client library! This project is community-driven and especially welcomes contributions from government agencies who can test with live USAi.gov API endpoints.

## 🚀 Quick Start

1. **Fork** this repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/your-feature`
5. **Make** your changes
6. **Test** your changes: `npm test`
7. **Submit** a pull request

## 📋 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/usai-api.git
cd usai-api

# Install dependencies
npm install

# Run tests
npm test

# Start development mode
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Build project
npm run build
```

## 🎯 Types of Contributions

### 🧪 **Most Needed: Live API Testing**
- Government agencies with USAi.gov API access
- Integration testing and feedback
- Bug reports from real-world usage
- Performance insights

### 🐛 **Bug Fixes**
- Fix issues with existing functionality
- Improve error handling
- Resolve TypeScript type issues

### ✨ **New Features**
- Support for new USAi.gov API endpoints
- Additional utility functions
- Enhanced government-specific features

### 📚 **Documentation**
- Improve README and examples
- Add government use case tutorials
- Update API documentation

### 🔒 **Security**
- Security vulnerability reports (see SECURITY.md)
- Government compliance improvements
- Authentication enhancements

## 📝 Pull Request Process

### Before Submitting
- [ ] Code follows the existing style (run `npm run format`)
- [ ] All tests pass (`npm test`)
- [ ] New code has appropriate tests
- [ ] Documentation is updated if needed
- [ ] Commit messages are descriptive

### PR Template
When submitting a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration testing (if applicable)
- [ ] Tested with live USAi.gov API (if available)

## Government Impact
- [ ] Affects government security considerations
- [ ] Changes authentication flow
- [ ] Impacts compliance requirements

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🔧 Code Standards

### TypeScript
- All code must be properly typed
- Use strict TypeScript configuration
- Export types for public APIs

### Formatting
```bash
# Use Prettier for consistent formatting
npm run format
```

### Linting
```bash
# Follow ESLint rules
npm run lint
```

### Testing
- Write unit tests for new functionality
- Maintain high test coverage
- Test error scenarios

### Documentation
- Update README for new features
- Add inline code documentation
- Include government-specific examples

## 🏛️ Government-Specific Guidelines

### Security Considerations
- Handle API keys securely
- Follow government security best practices
- Consider FedRAMP compliance requirements

### Use Cases
- Focus on federal agency needs
- Consider compliance and audit requirements
- Support government document processing

### Examples
- Use realistic government scenarios
- Avoid sensitive or classified information
- Include FOIA, compliance, and policy examples

## 🐛 Reporting Issues

### Bug Reports
Include:
- Node.js version
- Library version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs

### Feature Requests
Include:
- Use case description
- Government agency benefit
- Proposed implementation approach
- Alternative solutions considered

## 💬 Getting Help

- **GitHub Discussions**: General questions and community help
- **GitHub Issues**: Bug reports and feature requests
- **Security Issues**: See SECURITY.md for private reporting

## 📜 Code of Conduct

This project follows a professional code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Consider the government community impact
- Maintain professional communication
- Respect security and privacy concerns

## 🏆 Recognition

Contributors will be recognized in:
- Release notes
- Contributors section
- Special recognition for government testing and feedback

Thank you for helping make this library better for the government community! 🇺🇸

# Testing Dependency Update PRs

This guide explains how to properly test automated dependency update PRs before merging.

## The Problem

Automated dependency update PRs created by GitHub Actions don't automatically trigger CI workflows due to GitHub's security restrictions. This means you can't immediately see if the dependency changes break anything.

## Solutions Available

### 1. **Comment `/test` on the PR** (Recommended)
Simply comment `/test` on any dependency update PR to trigger a full CI pipeline:

```
/test
```

This will:
- ✅ Run tests on all Node.js versions (16.x, 18.x, 20.x)
- ✅ Run linting and formatting checks
- ✅ Build the project
- ✅ Test all example files
- ✅ Post results back as comments

**Requirements**: You must be a repository owner, member, or collaborator.

### 2. **Manual Workflow Dispatch**
Go to **Actions → Test Branch** and manually trigger a test run:

1. Click on "Test Branch" workflow
2. Click "Run workflow"
3. Enter branch name: `automated-dependency-updates`
4. Choose test type: `full`, `quick`, or `examples-only`
5. Click "Run workflow"

### 3. **Local Testing**
Test the changes locally before merging:

```bash
# Fetch and checkout the dependency update branch
git fetch origin automated-dependency-updates
git checkout automated-dependency-updates

# Install and test
npm ci
npm test
npm run build

# Test examples
node examples/basic-usage.js
node examples/embeddings.js  
node examples/enhanced-features.js
```

### 4. **Use a Personal Access Token** (Advanced)
Repository maintainers can set up a `PAT_TOKEN` secret:

1. Create a Personal Access Token with `repo` scope
2. Add it as a repository secret named `PAT_TOKEN`
3. Future dependency PRs will automatically trigger CI workflows

## What Gets Tested

All testing methods validate:

- **Multi-version compatibility**: Node.js 16.x, 18.x, 20.x
- **Code quality**: ESLint linting and Prettier formatting
- **Functionality**: Complete test suite (22 tests)
- **Build process**: TypeScript compilation
- **Examples**: All example files import correctly
- **Security**: npm audit for vulnerabilities

## Before Merging

Always ensure:

- [ ] CI pipeline passes (trigger manually if needed)
- [ ] No critical security vulnerabilities introduced
- [ ] Examples still work correctly
- [ ] No breaking changes affect existing APIs
- [ ] Dependencies are approved for government use (if applicable)

## Troubleshooting

**If `/test` command doesn't work:**
- Ensure you're a repository collaborator
- Try the manual workflow dispatch method
- Fall back to local testing

**If tests fail with npm registry errors:**
- The CI pipeline has robust fallback strategies
- It will retry with cache clearing and fresh installs
- Check the full workflow logs for details

**If examples fail:**
- Expected: API calls will fail (no API key configured)
- Unexpected: Import/module errors indicate dependency issues

## Automation Details

The dependency management workflow:
- 🕒 Runs weekly on Wednesdays at 10 AM UTC
- 🔍 Checks for security updates first
- 📦 Updates dependencies with `npm-check-updates`
- 🛡️ Runs security audits
- 📝 Creates detailed PR with testing instructions
- 🤖 Uses PAT if available to trigger CI automatically

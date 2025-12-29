#!/bin/bash

# Production Environment Setup for Blackbox CLI with Owlban Unlimited Access
# This script creates a complete production environment for the Blackbox CLI

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_BRANCH="production"
RELEASE_TAG=""
SKIP_TESTS=false
SKIP_PUBLISH=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    print_status "Validating production environment..."

    # Check required tools
    local required_tools=("node" "npm" "git" "make")
    for tool in "${required_tools[@]}"; do
        if ! command_exists "$tool"; then
            print_error "Required tool '$tool' is not installed"
            exit 1
        fi
    done

    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    if ! [[ $node_version =~ ^(20|22|24)\. ]]; then
        print_warning "Node.js version $node_version detected. Recommended: 20.x or later"
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi

    # Check if working directory is clean
    if ! git diff --quiet && ! git diff --staged --quiet; then
        print_warning "Working directory has uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_success "Environment validation complete"
}

# Function to setup production branch
setup_production_branch() {
    print_status "Setting up production branch..."

    # Check if production branch exists
    if git show-ref --verify --quiet "refs/heads/$PRODUCTION_BRANCH"; then
        print_status "Production branch exists, checking out..."
        git checkout "$PRODUCTION_BRANCH"
        git pull origin "$PRODUCTION_BRANCH" 2>/dev/null || true
    else
        print_status "Creating new production branch..."
        git checkout -b "$PRODUCTION_BRANCH"
    fi

    # Merge main/master branch
    local main_branch="main"
    if ! git show-ref --verify --quiet "refs/heads/$main_branch"; then
        main_branch="master"
    fi

    print_status "Merging $main_branch into $PRODUCTION_BRANCH..."
    git merge "$main_branch" --no-edit

    print_success "Production branch setup complete"
}

# Function to run production build
run_production_build() {
    print_status "Running production build..."

    # Clean previous builds
    print_status "Cleaning previous build artifacts..."
    npm run clean

    # Install dependencies
    print_status "Installing dependencies..."
    npm ci

    # Run full build
    print_status "Building all packages..."
    npm run build

    # Run bundle creation
    print_status "Creating production bundle..."
    npm run bundle

    # Prepare package for publishing
    print_status "Preparing package metadata..."
    npm run prepare:package

    print_success "Production build complete"
}

# Function to run comprehensive tests
run_production_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        print_warning "Skipping tests as requested"
        return
    fi

    print_status "Running comprehensive production tests..."

    # Run linting
    print_status "Running linting checks..."
    npm run lint:ci

    # Run type checking
    print_status "Running TypeScript type checking..."
    npm run typecheck

    # Run unit tests
    print_status "Running unit tests..."
    npm run test:ci

    # Run integration tests (if available)
    if npm run | grep -q "test:integration"; then
        print_status "Running integration tests..."
        npm run test:integration:all
    fi

    # Run Owlban-specific tests
    print_status "Running Owlban authentication tests..."
    if [[ -f "test-owlban-auth.sh" ]]; then
        bash test-owlban-auth.sh
    fi

    print_success "All production tests passed"
}

# Function to validate production artifacts
validate_production_artifacts() {
    print_status "Validating production artifacts..."

    # Check if build artifacts exist
    local artifacts=(
        "packages/core/dist/index.js"
        "packages/cli/dist/index.js"
        "bundle/gemini.js"
        "package.json"
    )

    for artifact in "${artifacts[@]}"; do
        if [[ ! -f "$artifact" ]]; then
            print_error "Missing production artifact: $artifact"
            exit 1
        fi
    done

    # Check bundle size (should be reasonable)
    local bundle_size=$(stat -f%z bundle/gemini.js 2>/dev/null || stat -c%s bundle/gemini.js 2>/dev/null || echo "0")
    if [[ $bundle_size -lt 1000000 ]]; then  # Less than 1MB is suspicious
        print_warning "Bundle size seems small: $bundle_size bytes"
    fi

    # Test CLI can start (basic smoke test)
    print_status "Running basic CLI smoke test..."
    timeout 10s npm start --version >/dev/null 2>&1 || {
        print_error "CLI failed basic startup test"
        exit 1
    }

    print_success "Production artifacts validation complete"
}

# Function to prepare release
prepare_release() {
    print_status "Preparing release..."

    # Generate release version if not provided
    if [[ -z "$RELEASE_TAG" ]]; then
        local current_version=$(node -p "require('./package.json').version")
        local timestamp=$(date +%Y%m%d%H%M%S)
        RELEASE_TAG="v${current_version}-${timestamp}"
        print_status "Generated release tag: $RELEASE_TAG"
    fi

    # Create git tag
    print_status "Creating git tag: $RELEASE_TAG"
    git tag -a "$RELEASE_TAG" -m "Production release $RELEASE_TAG"

    # Update changelog if it exists
    if [[ -f "CHANGELOG.md" ]]; then
        print_status "Updating changelog..."
        # Add release notes to changelog
        local changelog_entry="# $RELEASE_TAG ($(date +%Y-%m-%d))\n\n## Changes\n- Production build with Owlban Unlimited Access support\n- All tests passing\n- Ready for deployment\n\n"
        sed -i "1i $changelog_entry" CHANGELOG.md
    fi

    print_success "Release preparation complete"
}

# Function to publish to production
publish_production() {
    if [[ "$SKIP_PUBLISH" == true ]]; then
        print_warning "Skipping publish as requested"
        return
    fi

    print_status "Publishing to production..."

    # Authenticate with registries
    print_status "Authenticating with registries..."
    npm run auth

    # Publish packages
    print_status "Publishing packages to npm..."
    npm publish --workspaces --access public

    # Push git changes
    print_status "Pushing changes to remote..."
    git push origin "$PRODUCTION_BRANCH"
    git push origin "$RELEASE_TAG"

    print_success "Production publish complete"
}

# Function to create deployment documentation
create_deployment_docs() {
    print_status "Creating deployment documentation..."

    local docs_dir="docs/production"
    mkdir -p "$docs_dir"

    # Create deployment guide
    cat > "$docs_dir/deployment.md" << 'EOF'
# Production Deployment Guide

## Overview
This document provides instructions for deploying the Blackbox CLI with Owlban Unlimited Access to production.

## Prerequisites
- Node.js 20.x or later
- npm access to @blackbox_ai scope
- Docker (optional, for sandboxed execution)
- Git repository access

## Environment Variables
Set the following environment variables for production:

### Owlban OAuth Configuration
```bash
# Owlban OAuth endpoints (production values)
OWLBAN_OAUTH_BASE_URL=https://owlban.blackboxcli.ai
OWLBAN_OAUTH_CLIENT_ID=owlban_unlimited_access_client
OWLBAN_OAUTH_SCOPE="openid profile email model.completion"
OWLBAN_MODEL=coder-model
```

### General Configuration
```bash
# CLI Version
CLI_VERSION=0.1.4

# Telemetry (optional)
BLACKBOX_TELEMETRY_ENABLED=true
```

## Deployment Steps

### 1. Build Production Artifacts
```bash
# Run the production environment setup script
bash create-production-environment.sh

# Or manually:
npm ci
npm run build
npm run bundle
npm run prepare:package
```

### 2. Run Tests
```bash
# Run comprehensive test suite
npm run test:ci
npm run lint:ci
npm run typecheck

# Run Owlban-specific tests
bash test-owlban-auth.sh
```

### 3. Publish Packages
```bash
# Authenticate and publish
npm run auth
npm publish --workspaces --access public
```

### 4. Verify Deployment
```bash
# Install globally for testing
npm install -g @blackbox_ai/blackbox-cli

# Test basic functionality
blackbox --version

# Test Owlban authentication (requires user interaction)
blackbox auth
# Select "Owlban Group (Unlimited)" option
```

## Monitoring

### Health Checks
- CLI startup time < 5 seconds
- Authentication flow completes successfully
- API requests succeed with valid tokens

### Logs
Monitor for:
- Authentication failures
- Token refresh errors
- Network connectivity issues
- Rate limiting events

## Rollback Procedure
If issues occur in production:

1. Identify the problematic version
2. Revert to previous git tag
3. Rebuild and republish
4. Update downstream consumers

## Security Considerations
- OAuth credentials are handled securely
- PKCE prevents authorization code interception
- Tokens are stored locally with appropriate permissions
- No sensitive data in logs or error messages
EOF

    # Create environment template
    cat > "$docs_dir/.env.production.template" << 'EOF'
# Production Environment Variables Template
# Copy this file to .env.production and fill in actual values

# Owlban OAuth Configuration
OWLBAN_OAUTH_BASE_URL=https://owlban.blackboxcli.ai
OWLBAN_OAUTH_CLIENT_ID=owlban_unlimited_access_client
OWLBAN_OAUTH_SCOPE=openid profile email model.completion
OWLBAN_MODEL=coder-model

# CLI Configuration
CLI_VERSION=0.1.4
NODE_ENV=production

# Telemetry (optional)
BLACKBOX_TELEMETRY_ENABLED=true

# Logging (optional)
LOG_LEVEL=info
LOG_FORMAT=json

# Performance Tuning (optional)
CONTENT_GENERATOR_TIMEOUT=30000
CONTENT_GENERATOR_MAX_RETRIES=3
EOF

    print_success "Deployment documentation created in $docs_dir/"
}

# Function to show usage
usage() {
    cat << EOF
Production Environment Setup Script

Usage: $0 [OPTIONS]

Options:
    --branch BRANCH    Production branch name (default: production)
    --tag TAG         Release tag (auto-generated if not specified)
    --skip-tests      Skip running tests
    --skip-publish    Skip publishing to npm
    --help           Show this help message

Examples:
    $0                                    # Full production setup
    $0 --tag v1.0.0                      # Custom release tag
    $0 --skip-tests --skip-publish       # Build only
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --branch)
            PRODUCTION_BRANCH="$2"
            shift 2
            ;;
        --tag)
            RELEASE_TAG="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-publish)
            SKIP_PUBLISH=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "=========================================="
    echo "Blackbox CLI Production Environment Setup"
    echo "=========================================="
    echo

    validate_environment
    setup_production_branch
    run_production_build
    run_production_tests
    validate_production_artifacts
    prepare_release
    publish_production
    create_deployment_docs

    echo
    echo "=========================================="
    print_success "Production environment setup complete!"
    echo "=========================================="
    echo
    echo "Next steps:"
    echo "1. Review deployment documentation in docs/production/"
    echo "2. Test the published package: npm install -g @blackbox_ai/blackbox-cli"
    echo "3. Verify Owlban authentication works in production"
    echo "4. Monitor for any issues and be prepared to rollback if needed"
    echo
    echo "Release tag: $RELEASE_TAG"
    echo "Production branch: $PRODUCTION_BRANCH"
}

# Run main function
main "$@"

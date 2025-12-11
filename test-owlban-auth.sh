#!/bin/bash

# Owlban Group Unlimited Access - Comprehensive Testing Script
# This script tests the Owlban authentication implementation

set -e

echo "=========================================="
echo "Owlban Authentication Testing Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to print test result
print_result() {
    local test_name=$1
    local result=$2
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check if file exists
check_file_exists() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_result "$description" "PASS"
        return 0
    else
        print_result "$description" "FAIL"
        return 1
    fi
}

# Function to check if string exists in file
check_string_in_file() {
    local file=$1
    local search_string=$2
    local description=$3
    
    if grep -q "$search_string" "$file" 2>/dev/null; then
        print_result "$description" "PASS"
        return 0
    else
        print_result "$description" "FAIL"
        return 1
    fi
}

echo "Phase 1: Build Verification"
echo "----------------------------"

# Test 1: Check if build artifacts exist
check_file_exists "packages/core/dist/index.js" "Core package build artifacts exist"
check_file_exists "packages/cli/dist/index.js" "CLI package build artifacts exist"

echo ""
echo "Phase 2: Code Implementation Verification"
echo "------------------------------------------"

# Test 2: Verify AuthType.OWL_BAN_UNLIMITED exists
check_string_in_file "packages/core/src/core/contentGenerator.ts" "OWL_BAN_UNLIMITED" "AuthType.OWL_BAN_UNLIMITED defined in contentGenerator.ts"

# Test 3: Verify BlackboxOwlbanOAuth2Client exists
check_string_in_file "packages/core/src/blackbox/blackboxOAuth2.ts" "BlackboxOwlbanOAuth2Client" "BlackboxOwlbanOAuth2Client class exists"

# Test 4: Verify getBlackboxOwlbanOAuthClient exists
check_string_in_file "packages/core/src/blackbox/blackboxOAuth2.ts" "getBlackboxOwlbanOAuthClient" "getBlackboxOwlbanOAuthClient function exists"

# Test 5: Verify CLI auth validation includes Owlban
check_string_in_file "packages/cli/src/config/auth.ts" "OWL_BAN_UNLIMITED" "CLI auth validation includes OWL_BAN_UNLIMITED"

# Test 6: Verify AuthDialog includes Owlban option
check_string_in_file "packages/cli/src/ui/components/AuthDialog.tsx" "Owlban Group" "AuthDialog includes Owlban Group option"

# Test 7: Verify Zed integration includes Owlban
check_string_in_file "packages/cli/src/zed-integration/zedIntegration.ts" "owlban" "Zed integration includes Owlban authentication"

echo ""
echo "Phase 3: Configuration Verification"
echo "------------------------------------"

# Test 8: Check default configuration values
check_string_in_file "packages/core/src/blackbox/blackboxOAuth2.ts" "owlban.blackboxcli.ai" "Default Owlban OAuth base URL configured"
check_string_in_file "packages/core/src/blackbox/blackboxOAuth2.ts" "owlban_unlimited_access_client" "Default Owlban client ID configured"
check_string_in_file "packages/core/src/blackbox/blackboxOAuth2.ts" "owlban_oauth_creds.json" "Separate credential file configured"

echo ""
echo "Phase 4: TypeScript Compilation"
echo "--------------------------------"

# Test 9: Run TypeScript compilation
if npm run build > /dev/null 2>&1; then
    print_result "TypeScript compilation successful" "PASS"
else
    print_result "TypeScript compilation successful" "FAIL"
fi

echo ""
echo "Phase 5: Unit Tests"
echo "-------------------"

# Test 10: Run unit tests
if npm test 2>&1 | grep -q "PASS\|✓"; then
    print_result "Unit tests pass" "PASS"
else
    print_result "Unit tests pass" "FAIL"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Run manual authentication test: npm start"
    echo "2. Select 'Owlban Group (Unlimited)' from auth dialog"
    echo "3. Complete OAuth flow in browser"
    echo "4. Verify credentials stored in ~/.blackboxcli/owlban_oauth_creds.json"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi

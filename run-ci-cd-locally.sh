#!/bin/bash

# CI/CD Pipeline Local Execution Script
# This script runs the same checks that GitHub Actions would run

set -e  # Exit on error

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'

echo -e "${COLOR_BLUE}"
echo "========================================"
echo "   CI/CD Pipeline - Local Execution    "
echo "========================================"
echo -e "${COLOR_RESET}"

START_TIME=$(date +%s)
ERROR_COUNT=0
WARNING_COUNT=0

# Change to project directory
cd /home/ubuntu/pro_pdf/nextjs_space

echo ""
echo -e "${COLOR_BLUE}[1/5] Lint and Type Check${COLOR_RESET}"
echo "-----------------------------------"

# TypeScript type check
echo "Running TypeScript type check..."
if yarn tsc --noEmit > /tmp/tsc-output.log 2>&1; then
    echo -e "${COLOR_GREEN}✅ TypeScript: 0 errors${COLOR_RESET}"
else
    echo -e "${COLOR_RED}❌ TypeScript: Errors found${COLOR_RESET}"
    cat /tmp/tsc-output.log | tail -20
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# ESLint
echo "Running ESLint..."
if yarn lint > /tmp/lint-output.log 2>&1; then
    echo -e "${COLOR_GREEN}✅ ESLint: No issues${COLOR_RESET}"
else
    LINT_WARNINGS=$(cat /tmp/lint-output.log | grep -i "warning" | wc -l || echo "0")
    if [ "$LINT_WARNINGS" -gt 0 ]; then
        echo -e "${COLOR_YELLOW}⚠️  ESLint: $LINT_WARNINGS warnings found${COLOR_RESET}"
        WARNING_COUNT=$((WARNING_COUNT + LINT_WARNINGS))
    else
        echo -e "${COLOR_RED}❌ ESLint: Errors found${COLOR_RESET}"
        cat /tmp/lint-output.log | tail -20
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
fi

echo ""
echo -e "${COLOR_BLUE}[2/5] Build Application${COLOR_RESET}"
echo "-----------------------------------"

# Generate Prisma Client
echo "Generating Prisma client..."
if yarn prisma generate > /tmp/prisma-output.log 2>&1; then
    echo -e "${COLOR_GREEN}✅ Prisma client generated${COLOR_RESET}"
else
    echo -e "${COLOR_RED}❌ Prisma generation failed${COLOR_RESET}"
    cat /tmp/prisma-output.log | tail -20
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Build Next.js
echo "Building Next.js application..."
if NODE_OPTIONS="--max-old-space-size=4096" __NEXT_TEST_MODE=1 NEXT_DIST_DIR=.build yarn build > /tmp/build-output.log 2>&1; then
    ROUTE_COUNT=$(cat /tmp/build-output.log | grep -E "^├|^└" | grep "ƒ" | wc -l || echo "0")
    echo -e "${COLOR_GREEN}✅ Build successful: $ROUTE_COUNT routes compiled${COLOR_RESET}"
    
    # Check bundle sizes
    BUNDLE_SIZE=$(du -sh .build 2>/dev/null | cut -f1 || echo "Unknown")
    echo "   Build size: $BUNDLE_SIZE"
else
    echo -e "${COLOR_RED}❌ Build failed${COLOR_RESET}"
    cat /tmp/build-output.log | tail -30
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo -e "${COLOR_BLUE}[3/5] E2E Tests${COLOR_RESET}"
echo "-----------------------------------"

# Check if Playwright is installed
if ! command -v playwright &> /dev/null; then
    echo -e "${COLOR_YELLOW}⚠️  Playwright not installed. Skipping E2E tests.${COLOR_RESET}"
    echo "   To run E2E tests, install Playwright:"
    echo "   yarn playwright install --with-deps chromium"
    WARNING_COUNT=$((WARNING_COUNT + 1))
else
    echo "Running Playwright E2E tests..."
    if __NEXT_TEST_MODE=1 yarn playwright test --project=chromium > /tmp/e2e-output.log 2>&1; then
        TEST_PASSED=$(cat /tmp/e2e-output.log | grep "passed" | tail -1 || echo "0")
        echo -e "${COLOR_GREEN}✅ E2E Tests: $TEST_PASSED${COLOR_RESET}"
    else
        TEST_FAILED=$(cat /tmp/e2e-output.log | grep "failed" | tail -1 || echo "0")
        echo -e "${COLOR_RED}❌ E2E Tests failed: $TEST_FAILED${COLOR_RESET}"
        cat /tmp/e2e-output.log | tail -30
        ERROR_COUNT=$((ERROR_COUNT + 1))
        echo ""
        echo "   Test report available at: playwright-report/index.html"
    fi
fi

echo ""
echo -e "${COLOR_BLUE}[4/5] Security Scan${COLOR_RESET}"
echo "-----------------------------------"

# Yarn audit
echo "Running yarn audit..."
if yarn audit --level moderate > /tmp/audit-output.log 2>&1; then
    echo -e "${COLOR_GREEN}✅ No security vulnerabilities found${COLOR_RESET}"
else
    VULN_COUNT=$(cat /tmp/audit-output.log | grep "vulnerabilities found" | tail -1 || echo "Unknown")
    echo -e "${COLOR_YELLOW}⚠️  Security audit: $VULN_COUNT${COLOR_RESET}"
    echo "   Review details with: yarn audit"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# Check outdated packages
echo "Checking for outdated packages..."
if yarn outdated > /tmp/outdated-output.log 2>&1; then
    echo -e "${COLOR_GREEN}✅ All packages up to date${COLOR_RESET}"
else
    OUTDATED_COUNT=$(cat /tmp/outdated-output.log | grep -v "Package" | grep -v "---" | grep -v "^$" | wc -l || echo "0")
    if [ "$OUTDATED_COUNT" -gt 0 ]; then
        echo -e "${COLOR_YELLOW}⚠️  $OUTDATED_COUNT packages have updates available${COLOR_RESET}"
        echo "   Run: yarn outdated"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
fi

echo ""
echo -e "${COLOR_BLUE}[5/5] Build Status Summary${COLOR_RESET}"
echo "-----------------------------------"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "Pipeline Results:"
echo "================="
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${COLOR_GREEN}✅ All checks passed!${COLOR_RESET}"
else
    echo -e "${COLOR_RED}❌ $ERROR_COUNT check(s) failed${COLOR_RESET}"
fi

if [ $WARNING_COUNT -gt 0 ]; then
    echo -e "${COLOR_YELLOW}⚠️  $WARNING_COUNT warning(s) found${COLOR_RESET}"
fi

echo ""
echo "Execution Time: ${MINUTES}m ${SECONDS}s"
echo ""

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${COLOR_GREEN}"
    echo "✅ CI/CD Pipeline: SUCCESS"
    echo -e "${COLOR_RESET}"
    exit 0
else
    echo -e "${COLOR_RED}"
    echo "❌ CI/CD Pipeline: FAILED"
    echo -e "${COLOR_RESET}"
    echo ""
    echo "Review the errors above and fix issues before deploying."
    echo ""
    exit 1
fi

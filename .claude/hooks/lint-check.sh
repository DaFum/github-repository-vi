#!/bin/bash
set -euo pipefail

# Lint Check Hook
# Runs ESLint on edited files to catch issues early
# Usage: PostToolUse hook for Edit|Write tools

# Read input from stdin
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 | head -n1)

# Only run for TypeScript/JavaScript files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Only run if the file exists
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Check if we're in a web environment (where node_modules might not be available yet)
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  # In web environment, check if node_modules exists
  if [ ! -d "$CLAUDE_PROJECT_DIR/node_modules" ]; then
    echo "Skipping lint check (dependencies not installed yet)" >&2
    exit 0
  fi
fi

# Run ESLint on the file
echo "Running ESLint on $(basename "$FILE_PATH")..."

# Run ESLint with proper error handling
if ! npx eslint "$FILE_PATH" --max-warnings 0 2>/dev/null; then
  echo "ESLint found issues in $FILE_PATH" >&2
  echo "Run 'npm run lint' to see details or fix issues automatically" >&2
  # Exit with code 2 to block and show message to Claude
  exit 2
fi

echo "ESLint check passed for $(basename "$FILE_PATH")"
exit 0

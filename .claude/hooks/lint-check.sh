#!/bin/bash
set -euo pipefail

# Lint Check Hook
# Runs ESLint on edited files to catch issues early
# Usage: PostToolUse hook for Edit|Write tools

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
  echo "Warning: 'jq' is not installed. Skipping lint check." >&2
  exit 0
fi

# Read input from stdin
INPUT=$(cat)

# Extract tool info using jq
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')

# Extract file path from tool_input
# Different tools have different structures, so we try multiple approaches
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // ""')

# If no file path found, exit silently
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

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
# Note: stderr is now shown so users can see specific ESLint errors
if ! npx eslint "$FILE_PATH" --max-warnings 0; then
  echo "" >&2
  echo "ESLint found issues in $FILE_PATH" >&2
  echo "Run 'npm run lint' to see all details or fix issues automatically" >&2
  # Exit with code 2 to block and show message to Claude
  exit 2
fi

echo "ESLint check passed for $(basename "$FILE_PATH")"
exit 0

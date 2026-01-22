#!/bin/bash
set -euo pipefail

# SessionStart Hook
# Ensures npm dependencies are installed when starting Claude Code on the web
# This prepares the development environment for coding tasks

# Only run in Claude Code on the web
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "Skipping dependency installation (not in web environment)"
  exit 0
fi

# Check if package.json exists
if [ ! -f "$CLAUDE_PROJECT_DIR/package.json" ]; then
  echo "Warning: package.json not found, skipping dependency installation" >&2
  exit 0
fi

# Install npm dependencies
# npm install is already optimized to skip work if nothing changed
echo "Installing npm dependencies..."

if npm install --silent; then
  echo "Dependencies installed successfully!"

  # Optionally run a quick verification
  if [ -x "$CLAUDE_PROJECT_DIR/node_modules/.bin/eslint" ]; then
    echo "ESLint is available"
  fi

  if [ -x "$CLAUDE_PROJECT_DIR/node_modules/.bin/tsc" ]; then
    echo "TypeScript compiler is available"
  fi
else
  echo "Warning: npm install encountered issues, but continuing..." >&2
  # Non-blocking error (exit code 1 instead of 2)
  exit 1
fi

exit 0

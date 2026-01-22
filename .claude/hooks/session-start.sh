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

# Check if node_modules already exists and is up to date
if [ -d "$CLAUDE_PROJECT_DIR/node_modules" ]; then
  echo "Checking if dependencies are up to date..."

  # Quick check: compare package.json modification time with node_modules
  if [ "$CLAUDE_PROJECT_DIR/package.json" -nt "$CLAUDE_PROJECT_DIR/node_modules" ]; then
    echo "package.json is newer than node_modules, reinstalling..."
  else
    echo "Dependencies are already installed and up to date!"
    exit 0
  fi
fi

# Install npm dependencies
echo "Installing npm dependencies..."

if npm install --silent 2>&1 | grep -v "^npm WARN"; then
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

#!/bin/bash
set -euo pipefail

# Add Project Context Hook
# Injects relevant project information at the start of conversations
# Usage: UserPromptSubmit hook (runs once per session)

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
  echo "Warning: 'jq' is not installed. Skipping add-context hook." >&2
  exit 0
fi

# Read input from stdin
INPUT=$(cat)

# Extract the prompt and session ID using jq
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // ""')

# Check if this is an empty or very short prompt (likely not the first real prompt)
if [ -z "$PROMPT" ] || [ ${#PROMPT} -lt 10 ]; then
  exit 0
fi

# Can't create a unique marker without a session ID
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

# Only add context once per session by checking for a marker file
CONTEXT_MARKER="/tmp/claude_context_${SESSION_ID}"

if [ -f "$CONTEXT_MARKER" ]; then
  # Context already added for this session
  exit 0
fi

# Mark that we've added context for this session
touch "$CONTEXT_MARKER"

# Dynamically extract versions from package.json
PACKAGE_JSON="$CLAUDE_PROJECT_DIR/package.json"
if [ -f "$PACKAGE_JSON" ]; then
  REACT_VERSION=$(jq -r '.dependencies.react // "installed"' "$PACKAGE_JSON")
  TYPESCRIPT_VERSION=$(jq -r '.devDependencies.typescript // "installed"' "$PACKAGE_JSON")
  VITE_VERSION=$(jq -r '.devDependencies.vite // "installed"' "$PACKAGE_JSON")
else
  REACT_VERSION="installed"
  TYPESCRIPT_VERSION="installed"
  VITE_VERSION="installed"
fi

# Build context output
cat << EOF
## Project Context

This is a React + TypeScript + Vite project with the following key characteristics:

**Tech Stack**:
- Frontend: React ${REACT_VERSION}, TypeScript ${TYPESCRIPT_VERSION}
- Build Tool: Vite ${VITE_VERSION}
- UI Libraries: Radix UI, Tailwind CSS
- State Management: Zustand
- Code Quality: ESLint, Prettier

**Project Scripts**:
- `npm run dev` - Start development server
- `npm run build` - Build for production (with TypeScript compilation)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

**Code Standards**:
- TypeScript is used throughout the project
- ESLint is configured for code quality
- Prettier is configured for code formatting
- Follow React best practices and hooks guidelines

**Development Guidelines**:
- Always run TypeScript compiler checks before major changes
- Ensure ESLint passes before committing
- Use proper TypeScript types (avoid 'any')
- Follow existing code structure and patterns
- Test changes with `npm run dev` when possible
EOF

exit 0

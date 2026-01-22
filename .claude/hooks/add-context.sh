#!/bin/bash
set -euo pipefail

# Add Project Context Hook
# Injects relevant project information at the start of conversations
# Usage: UserPromptSubmit hook (runs once per session)

# Read input from stdin
INPUT=$(cat)

# Extract the prompt to check if this is the first user message
PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | cut -d'"' -f4)

# Check if this is an empty or very short prompt (likely not the first real prompt)
if [ -z "$PROMPT" ] || [ ${#PROMPT} -lt 10 ]; then
  exit 0
fi

# Only add context once per session by checking for a marker file
SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
CONTEXT_MARKER="/tmp/claude_context_${SESSION_ID}"

if [ -f "$CONTEXT_MARKER" ]; then
  # Context already added for this session
  exit 0
fi

# Mark that we've added context for this session
touch "$CONTEXT_MARKER"

# Build context output
cat << 'EOF'
## Project Context

This is a React + TypeScript + Vite project with the following key characteristics:

**Tech Stack**:
- Frontend: React 19.2.3, TypeScript 5.9.3
- Build Tool: Vite 7.3.1
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

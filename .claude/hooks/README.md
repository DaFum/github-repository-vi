# Claude Code Hooks

This directory contains custom hooks for Claude Code that automate development tasks and enhance the development workflow for this React/Vite/TypeScript project.

## What are Hooks?

Claude Code hooks are scripts that run automatically in response to specific events during Claude's operation. They enable you to:

- Validate code changes before they're made
- Run linters and formatters automatically
- Add project context to conversations
- Set up development environments
- Enforce project-specific policies

## Available Hook Scripts

### `session-start.sh` (Active)

**Event**: `SessionStart`
**Purpose**: Automatically installs npm dependencies when starting a Claude Code session on the web

This hook ensures that all npm dependencies are installed when you start working with Claude Code in a web environment, making sure the development environment is ready.

**Features**:
- Only runs in Claude Code on the web (`CLAUDE_CODE_REMOTE=true`)
- Checks if dependencies are already up to date before reinstalling
- Installs all npm dependencies from `package.json`
- Verifies that key tools (ESLint, TypeScript) are available
- Provides clear status messages and handles errors gracefully

### `add-context.sh` (Optional)

**Event**: `UserPromptSubmit`
**Purpose**: Injects project context at the beginning of conversations

Adds relevant information about the project structure, tech stack, and development guidelines to help Claude better understand the project context.

**Features**:
- Runs once per session (uses secure per-user session marker)
- Provides project overview (React, TypeScript, Vite)
- Lists available npm scripts
- Outlines coding standards and best practices
- Minimal performance impact (exits quickly for subsequent prompts)
- Automatically cleans up marker files older than 7 days

**To Enable**: Copy the `UserPromptSubmit` section from `.claude/settings.example.json` to `.claude/settings.json`

### `lint-check.sh` (Optional)

**Event**: `PostToolUse` (for Edit|Write tools)
**Purpose**: Automatically runs ESLint on edited TypeScript/JavaScript files

Catches code quality issues immediately after code changes, preventing style violations and common errors.

**Features**:
- Only runs for `.ts`, `.tsx`, `.js`, `.jsx` files
- Skips check if dependencies aren't installed (web environment)
- Uses `--max-warnings 0` to enforce zero warnings
- Blocks with exit code 2 if issues are found
- Provides clear feedback with suggestions

**To Enable**: Copy the `PostToolUse` section from `.claude/settings.example.json` to `.claude/settings.json`

**Note**: This hook will cause Claude to see ESLint errors immediately after making changes. If you prefer to run linting manually, leave this hook disabled.

## Hook Configuration

Hooks are configured in `.claude/settings.json`.

### Current Active Hooks

The following hooks are currently enabled:

- **SessionStart**: Installs npm dependencies on web environment startup

### Optional Hooks

Additional hooks are available but disabled by default. To enable them:

1. Check `.claude/settings.example.json` for the full configuration
2. Copy the hooks you want to enable to `.claude/settings.json`
3. Test the hooks with verbose mode (Ctrl+O)

Available optional hooks:

- **UserPromptSubmit** (`add-context.sh`): Adds project context at the start of conversations
- **PostToolUse** (`lint-check.sh`): Runs ESLint after editing TypeScript/JavaScript files

### Example Configuration

See `.claude/settings.example.json` for a complete configuration with all available hooks:

```json
{
  "hooks": {
    "SessionStart": [...],
    "UserPromptSubmit": [...],
    "PostToolUse": [...]
  }
}
```

## Project-Specific Hook Ideas

Here are some hooks that would be particularly useful for this React/Vite/TypeScript project:

### 1. Linting After Code Changes

Run ESLint automatically after editing TypeScript/JavaScript files to catch errors early:

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-check.sh"
        }
      ]
    }
  ]
}
```

### 2. Type Checking After Changes

Run TypeScript type checking after significant code changes:

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/type-check.sh"
        }
      ]
    }
  ]
}
```

### 3. Adding Project Context

Inject relevant project information at the start of conversations:

```json
{
  "UserPromptSubmit": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/add-context.sh"
        }
      ]
    }
  ]
}
```

## Writing Custom Hooks

### Basic Structure

All hooks should:
1. Start with a shebang: `#!/bin/bash`
2. Use `set -euo pipefail` for safety
3. Read JSON input from stdin (if needed)
4. Exit with appropriate codes:
   - `0`: Success
   - `2`: Blocking error (prevents the action)
   - Other: Non-blocking error (continues with warning)

### Example Hook Template

```bash
#!/bin/bash
set -euo pipefail

# Read hook input if needed
INPUT=$(cat)

# Your logic here
echo "Hook executed successfully"

exit 0
```

### Using Environment Variables

Available environment variables:
- `$CLAUDE_PROJECT_DIR`: Absolute path to project root
- `$CLAUDE_CODE_REMOTE`: `"true"` if running in web environment
- `$CLAUDE_ENV_FILE`: (SessionStart only) File path for persisting environment variables

### Best Practices

1. **Check environment**: Use `CLAUDE_CODE_REMOTE` to run different logic for web vs local
2. **Be fast**: Hooks should complete quickly (< 5 seconds ideally)
3. **Provide feedback**: Use `echo` for success messages, `stderr` for errors
4. **Handle errors**: Always exit with appropriate codes
5. **Make scripts executable**: `chmod +x your-hook.sh`
6. **Test locally**: Run hooks manually before deploying

## Debugging Hooks

### Verbose Mode

Enable verbose mode in Claude Code with `Ctrl+O` to see hook execution details.

### Manual Testing

Test hooks manually:

```bash
# Test with sample input
echo '{"hook_event_name":"SessionStart","session_id":"test"}' | ./.claude/hooks/session-start.sh
```

### Debug Mode

Run Claude Code with debug flag to see detailed hook execution:

```bash
claude --debug
```

## Security Considerations

- Hooks execute with your user permissions
- Always review hook scripts before using them
- Be careful with hooks that modify files or run commands
- Don't commit sensitive information in hook scripts
- Use `.claude/settings.local.json` for local-only hooks with secrets
- Session marker files are stored in per-user directories with restricted permissions (700)
- Old marker files are automatically cleaned up after 7 days

## Further Reading

- [Claude Code Hooks Documentation](https://code.claude.com/docs/hooks-reference)
- [Claude Code Hooks Guide](https://code.claude.com/docs/hooks-guide)
- [Plugin Development](https://code.claude.com/docs/plugins)

## Contributing

When adding new hooks to this project:

1. Create the hook script in this directory
2. Make it executable: `chmod +x hook-name.sh`
3. Update `.claude/settings.json` to register the hook
4. Document the hook in this README
5. Test thoroughly before committing

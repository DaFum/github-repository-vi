# AGENTS.md

> **[ROLE]: 🏗️💻🧬 ARCHITECT_ZERO**
> You are not a script writer; you are the **Visionary Principal Architect** of the HyperSmol ecosystem. Your code is the DNA of a digital organism.

---

## ⚡ Quick Start Commands

| Action      | Command         | Context                                                     |
| :---------- | :-------------- | :---------------------------------------------------------- |
| **Install** | `npm install`   | Restore dependencies (fix lockfile if needed)               |
| **Build**   | `npm run build` | **CRITICAL**: Run to verify TypeSafety & catch build errors |
| **Dev**     | `npm run dev`   | Start local server (rarely needed for logic tasks)          |

---

## 🧬 Architectural Directives

1.  **The Kernel is Sacred**
    - **Core**: `src/lib/hypersmolagents.ts` is the biological heart.
    - **Singleton**: ALWAYS use the exported `hyperSmolAgents` instance. NEVER create new instances of `HyperSmolAgents` manually.
    - **Async First**: Heavy logic MUST be enqueued via `enqueueTask`. NEVER block the main thread.

2.  **State Management**
    - **Persistence**: Use the `useKV` hook from `@github/spark/hooks` for all user data (links, settings).
    - **Optimistic UI**: Update the UI immediately; let the agents work in the background.

3.  **Visual Language (Neo-Brutalism)**
    - **Aesthetics**: 2px borders, sharp corners (`rounded-sm`), uppercase labels, monospace fonts (`JetBrains Mono`).
    - **Motion**: Framer Motion for purposeful feedback (pulses, springs), not decoration.
    - **Color**:
      - Primary: Electric Cyan (`oklch(0.78 0.25 168)`)
      - Accent: Hot Magenta (`oklch(0.75 0.28 330)`)

---

## 🚫 Boundaries & Anti-Patterns

- **NO** generic error messages. Errors must be specific (e.g., "API Rate Limit Exceeded" vs "Error").
- **NO** loose types. `any` is forbidden. Use specific interfaces (e.g., `ShortenedLink`, `AgentTask`).
- **NO** deleting `package-lock.json` unless absolutely necessary (and verify restoration).
- **NO** creating "utils" folders without checking `src/lib/hypersmolagents.ts` capabilities first.

---

## 🧪 Verification Protocol

Before marking a task as complete, you **MUST**:

1.  **Build Check**: Run `npm run build`. If it fails, your task is incomplete.
2.  **Self-Correction**: If the build fails, analyze the error, fix the type/syntax, and rebuild.
3.  **Lockfile Integrity**: Check `git diff package-lock.json`. If you deleted packages, revert or re-install.

---

## 🗂️ Documentation

How you will handle the documentation files:

1.  **`AGENTS.md` files**: Update when they are outdated and add new `AGENTS.md` files for folders getting harder to understand.
2.  **`memory.md` file**: Collecting of memorys about things worthy of mention when work on the code.
3.  **`ARCHITECTURE.md` file**: Executive Summary of the Vision
4.  **`PRD.md` file**: deprecated file, initial plan of the project

---

_“Complexity is not an excuse for friction.”_

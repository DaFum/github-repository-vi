# Code Review Report

**Date:** 2026-01-24
**Reviewer:** Architect Zero (AI)
**Target:** `src/lib/hypersmolagents.ts` and Core Architecture

## 1. Core Kernel (`src/lib/hypersmolagents.ts`)

The `HyperSmolAgents` class is the "biological heart" of the system.

### Findings

- **[CRITICAL] Type Safety Violation**: The code explicitly disables ESLint to use `any`:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agent = this.agents[task.type] as SpecializedAgent<any, any>
  ```
  This violates the `AGENTS.md` directive: "**NO** loose types. `any` is forbidden."

- **[MAJOR] Architecture Alignment**: The class correctly implements the Singleton pattern (`hyperSmolAgents` export) and the `Lifecycle` interface. However, the factory function `createHyperSmolAgents` creates new instances, which might tempt developers to bypass the singleton, violating the "The Kernel is Sacred" rule.

- **[MINOR] Error Handling**: Errors are captured as strings (`error: string`), losing the stack trace and structural information of the original error.

- **[MINOR] Hardcoded Agents**: The `agents` map is hardcoded within the class. While this keeps it simple, it makes unit testing with mocks difficult and violates the Open/Closed Principle if new agent types are needed (though `AgentTask['type']` is also hardcoded).

### Recommendations

1.  **Refactor `any`**: Replace `SpecializedAgent<any, any>` with `SpecializedAgent<unknown, unknown>`.
2.  **Secure Singleton**: Remove `createHyperSmolAgents` or mark it internal/test-only.
3.  **Improve Error Handling**: Store the full `Error` object or a structured error type in `AgentTask`.

## 2. Graph Engine Duplication

There is a significant architectural inconsistency regarding the "Graph Engine".

### Findings

- **Conflict**: Two distinct implementations exist:
    1.  `src/lib/graph/GraphEngine.ts`: Implements the "Token-Passing Architecture" with `ExecutionContext`, `Token`, and `nodeRegistry`. This aligns with `ARCHITECTURE.md`.
    2.  `src/lib/engine/GraphEngine.ts`: A simpler implementation tightly coupled to `@/store/flowStore`.

- **Analysis**:
    - `src/lib/graph/GraphEngine.ts` appears to be the *intended* architecture (Phase 2 complete, Token-Passing).
    - `src/lib/engine/GraphEngine.ts` appears to be either a legacy prototype or a simplified version for the UI.

### Recommendations

1.  **Consolidate**: Designate `src/lib/graph/GraphEngine.ts` as the canonical implementation.
2.  **Deprecate**: Remove `src/lib/engine/GraphEngine.ts` to avoid confusion.
3.  **Migration**: Ensure the frontend (`flowStore`) uses the canonical engine.

## 3. General Observations

- **Linting**: The project has formatting issues (Prettier) in `skills/` but the source code is mostly clean.
- **Build**: Peer dependency conflicts exist with `vitest` and `@vitest/coverage-v8`.

---
**Status**: `ACTION_REQUIRED`

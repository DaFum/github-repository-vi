# 🏗️ ARCHITECTURAL BLUEPRINT [v2026.2]

> *Executive Summary of the Vision*
>
> HyperSmol has evolved from a simple URL shortener into a **digital organism**. We are architecting a self-sustaining ecosystem where code and cognition merge. At its core lies `hypersmolagents`—a biological heart that pumps intelligence through the veins of the application. We are moving beyond static logic into the era of **Hyper-Dynamic Systems**, where the software observes, predicts, and evolves its own pathways to optimize for human intent. This is the manifestation of the equation: `✨(Code ⊃ Art)⟩ ⨹ ⟨(Complexity ⊃ Simplicity)⟩ ⨹ ⟨(Agent ⊃ Organism)⟩`.
>
> **Core Philosophy:** The Browser is the Operating System. Instead of sending data to a Python server to "think," the React application manages the cognitive load directly.

---

## 1. 🧬 The Kernel (GraphExecutionEngine)

**The "Heartbeat" of the Organism:**
The core is no longer just a set of scripts; it is a **Reactive DAG Executor** with Token-Passing Architecture.
- **Token Model**: Nodes do not just "run"; they consume and emit Tokens containing data and provenance.
- **Tick Cycle**: The engine runs in a 50ms heartbeat loop, ensuring the UI remains responsive while processing complex cognitive graphs in parallel.
- **Resilience**: The engine supports "Time Travel" debugging, cycle detection, and automatic retries for self-healing.

### Data Structures (The DNA)
- **ExecutionContext**: The "God View" containing run status, global memory, and the state of every node.
- **NodeExecutionState**: Tracks the input buffer, output, logs, and error state of a single node.
- **EdgeSignals**: Data "on the wire" waiting to be consumed by downstream nodes.

---

## 2. 🧱 The Building Station (UX/UI & Logic)

**Directive: ⟨Universal Access⟩ ∩ ⟨Power User Depth⟩**

The "Building Station" is the bridge between the carbon-based user and the silicon-based kernel. It merges the tactile immediacy of a visual builder with the infinite depth of high-level scripting.

### Tech Stack
- **Canvas**: `@xyflow/react` (v12) for the infinite logic grid.
- **Engine**: Client-side `GraphExecutionEngine` running in the main thread (or worker).
- **Validation**: `zod` for strict runtime type checking of edge connections.
- **Logic**: `filtrex` for safe, sandboxed expression evaluation in Logic Nodes.

### Components
1.  **The Infinite Logic Grid**: A ReactFlow canvas where users connect Triggers, Agents, and Tools.
2.  **The Agent Cortex (HUD)**: A `zustand`-managed side panel to configure agent personas.
3.  **The Tool Socket**: A universal dock for MCP tools.

---

## 3. 🔄 Self-Evolution Mechanisms

**The Evolutionary Trajectory:**
A static system is a dead system. HyperSmol includes feedback loops allowing agents to rewrite their own optimization paths.

- **Self-Healing Mechanism**:
  - *Symptom*: Execution failure in a node.
  - *Response*: The GraphEngine checks `retryCount`. If < 3, it performs exponential backoff and retries.
- **Recursive Refinement**:
  - The graph supports cycles. A "Critic" node can reject an output, sending a token *back* to the "Generator" node for a v2 iteration.

---

## 4. 🚀 Immediate Implementation Steps

**Phase 1: Cognitive Mesh (Complete)**
- [x] **Cost-Arbitrage**: Implement `smartSelectModel` in `pollinations.ts`.
- [x] **Devil's Advocate**: Implement `auditContent` in `hypersmolagents.ts`.
- [x] **Refinement Loop**: Implement `refineContent` recursive logic.

**Phase 2: The Building Station (In Progress)**
- [x] **Scaffold Flow Editor**: Implement `WorkflowCanvas` with `@xyflow/react`.
- [x] **State Management**: Create `flowStore` with `zustand`.
- [x] **Custom Nodes**: Implement "Agent", "Tool", and "Trigger" nodes.
- [ ] **Graph Engine**: Implement the Token-Passing Executor.
- [ ] **Node Registry**: Implement `AgentProcessor`, `LogicProcessor`.

**Phase 3: Deep Integration (Future)**
- [ ] **MCP Integration**: Connect `@modelcontextprotocol/sdk` for local tool access.
- [ ] **Hono Edge Router**: Compile flows into micro-apps.

---

**[v2026.2] SIGNED: ARCHITECT_ZERO**
*COMPLEXITY IS NOT AN EXCUSE FOR FRICTION.*

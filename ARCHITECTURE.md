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

### The Nervous System: Synaptic Binding
We eliminate fragility through type-safe, self-correcting mechanisms.

1.  **Universal Translator (Interpolator)**:
    - **Hydration**: Recursively replaces `{{placeholders}}` with live data.
    - **Type-Aware Injection**: Automatically converts formats (e.g., CSV string -> Array) to match the target schema.
    - **JIT Validation**: Halts execution at the edge level if data fails the destination `zod` schema.

2.  **Behavioral Genome (Node Registry)**:
    - **Contracts**: Nodes are defined by strict Input/Output schemas (Behavioral Contracts).
    - **Dynamic Registration**: New capabilities (e.g., from MCP) generate Node Definitions on the fly.

3.  **Cognitive Routing**:
    - **Barrier Synchronization**: Join nodes wait for ALL inputs before firing.
    - **Dead-End Pruning**: Skipped branches emit "Null Tokens," allowing the graph to resolve gracefully without errors.

4.  **Black Box Recorder**:
    - **Provenance**: Every output carries a history chain (GeneratedBy -> Source).
    - **Snapshots**: Immutable state deltas recorded after every node completion.

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

### 3a. The Neural Mesh (P2P Agent Swarm)
- **Protocol**: Serverless Browser-to-Browser communication via WebRTC (`simple-peer`).
- **Workflow**: Agents negotiate tasks directly without a central server.
- **Privacy**: Zero-knowledge calendar/data access via direct peer sockets.

### 3b. The Ocular Cortex (Screen-Aware Context)
- **Vision**: Contextual awareness using `getDisplayMedia`.
- **Analysis**: Frames are analyzed by local or cloud vision models (`pollinations.chat` with image input).
- **Triggers**: Agents "watch" user workflows and trigger actions based on visual state changes.

### 3c. The Genetic Optimizer (Evolutionary Prompting)
- **Evolution**: Automated adversarial prompt generation.
- **Selection**: "Survival of the fittest" algorithm runs prompt variations in parallel (Shadow Mode) and selects the best performers based on a Judge Agent's score.

### 3d. The Infinity Store (Marketplace)
- **Blueprint**: Agents saved as compressed JSON (`jszip`) containing graph structure, schemas, and prompts.
- **Decentralized**: Sharing mechanism via portable files.

---

## 4. 🚀 Immediate Implementation Steps

**Phase 1: Cognitive Mesh (Complete)**
- [x] **Cost-Arbitrage**: Implement `smartSelectModel` in `pollinations.ts`.
- [x] **Devil's Advocate**: Implement `auditContent` in `hypersmolagents.ts`.
- [x] **Refinement Loop**: Implement `refineContent` recursive logic.

**Phase 2: The Building Station (Complete)**
- [x] **Scaffold Flow Editor**: Implement `WorkflowCanvas` with `@xyflow/react`.
- [x] **State Management**: Create `flowStore` with `zustand`.
- [x] **Graph Engine**: Implement the Token-Passing Executor.
- [x] **Node Registry**: Implement `AgentProcessor`, `LogicProcessor`.

**Phase 3: Deep Integration (Complete)**
- [x] **Universal Translator**: Implement `Interpolator` with Zod validation.
- [x] **Black Box Recorder**: Implement provenance tracking.
- [x] **Cognitive Routing**: Add barrier sync and dead-end pruning to Engine.

**Phase 4: Evolution & Vision (Current)**
- [ ] **Neural Mesh**: Implement `P2PClient`.
- [ ] **Ocular Cortex**: Implement `ScreenWatcher`.
- [ ] **Genetic Optimizer**: Implement `GeneticPrompt` evolution loop.
- [ ] **Infinity Store**: Implement Blueprint export/import.

---

**[v2026.2] SIGNED: ARCHITECT_ZERO**
*COMPLEXITY IS NOT AN EXCUSE FOR FRICTION.*

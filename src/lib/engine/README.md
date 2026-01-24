# Graph Execution Engine

The **Heartbeat** of AETHER_OS — a Token-Passing execution engine for visual agent workflows.

## Architecture: Token-Passing Model

Unlike traditional sequential execution, the Graph Engine uses a **Token-Passing Architecture** inspired by Petri Nets.

```text
┌─────────────────────────────────────┐
│   Token                             │
│   - id, data, sourceNodeId          │
│   - provenance, metadata            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Node (Ready when all inputs       │
│         have tokens)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Execute                           │
│   - Interpolate inputs              │
│   - Validate with Zod               │
│   - Run processor                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Emit Tokens                       │
│   - Create tokens for each edge     │
│   - Place on outgoing wires         │
└─────────────────────────────────────┘
```

## Key Concepts

### 1. **Tick-Based Execution** (Non-Blocking)
The engine runs in **ticks** (default: 50ms intervals). Each tick:
1. Finds ready nodes (all inputs available).
2. Executes up to `maxConcurrent` nodes in parallel.
3. Propagates outputs as tokens.
4. Checks for completion or deadlock.

This ensures the UI never freezes and allows pause/resume.

### 2. **Tokens** (The Currency)
A token is a packet of data traveling through the graph. Every token carries its history (provenance), enabling "time-travel" debugging.

### 3. **Readiness Check**
A node is **ready** when:
- Its status is `'pending'`.
- All incoming edges have tokens OR signals.

### 4. **Deadlock Detection**
The engine automatically detects when execution is stuck (nodes pending but no tokens moving) and halts to prevent infinite waits.

## Usage

```typescript
import { GraphEngine } from './GraphEngine'

const engine = new GraphEngine(graph, {
  maxConcurrent: 3,
  tickInterval: 50,
})

// Subscribe to updates for reactive UI
engine.subscribe((context) => {
  console.log('Status:', context.status)
})

// Lifecycle control
engine.start()
engine.pause()
engine.resume()
engine.stop()
```

## Environment & Secrets
Use `engine.setEnv('KEY', 'value')` to inject API keys or configuration safely. These are accessible in nodes via `{{$env.KEY}}`.

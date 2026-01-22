# Graph Execution Engine

The **Heartbeat** of AETHER_OS — a Token-Passing execution engine for visual agent workflows.

## Architecture: Token-Passing Model

Unlike traditional sequential execution, the Graph Engine uses a **Token-Passing Architecture** inspired by Petri Nets.

```
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

1. Finds ready nodes (all inputs available)
2. Executes up to `maxConcurrent` nodes in parallel
3. Propagates outputs as tokens
4. Checks for completion or deadlock

This ensures the UI never freezes and allows pause/resume.

### 2. **Tokens** (The Currency)

A token is a packet of data traveling through the graph:

```typescript
{
  id: 'token-123',
  data: { message: 'Hello' },
  sourceNodeId: 'node1',
  edgeId: 'edge-node1-node2',
  createdAt: 1234567890,
  metadata: {
    path: ['start', 'node1'], // Provenance
    iteration: 2               // For loops
  }
}
```

### 3. **Readiness Check**

A node is **ready** when:
- Its status is `'pending'`
- All incoming edges have tokens OR signals

Example:
```
Node A (completed) ──token──> Node C (waiting)
Node B (completed) ──token──> Node C (now ready!)
```

### 4. **Parallel Execution**

The engine can run multiple nodes simultaneously (default: 3 concurrent).

```
       Start
      /  |  \
     A   B   C  ← All execute in parallel
      \  |  /
       End
```

### 5. **Provenance Tracking**

Every token carries its history:

```typescript
token.metadata.path = ['start', 'process1', 'process2']
```

This enables:
- "Where did this data come from?"
- "Which nodes contributed to this result?"
- Time-travel debugging

## Usage

### Basic Execution

```typescript
import { GraphEngine } from './GraphEngine'

const graph = {
  nodes: [
    { id: 'start', type: 'llm-agent', config: { model: 'openai' } },
    { id: 'process', type: 'router', config: {} },
    { id: 'end', type: 'llm-agent', config: {} },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'process' },
    { id: 'e2', source: 'process', target: 'end' },
  ],
}

const engine = new GraphEngine(graph, {
  maxConcurrent: 3,
  maxLoopIterations: 10,
  tickInterval: 50,
})

// Subscribe to updates
engine.subscribe((context) => {
  console.log('Status:', context.status)
  console.log('Nodes:', context.nodeStates)
})

// Engine starts automatically
// To manually control:
engine.pause()
engine.resume()
engine.stop()
```

### Setting Environment Variables

```typescript
// Set API keys, config, etc.
engine.setEnv('API_KEY', 'sk-...')
engine.setEnv('MODEL', 'claude')

// Accessible in nodes via {{$env.API_KEY}}
```

### Setting Global Memory

```typescript
// Store data accessible to all nodes
engine.setGlobal('userName', 'Alice')
engine.setGlobal('sessionId', '123')

// Accessible via {{$global.userName}}
```

### Monitoring Execution

```typescript
const unsubscribe = engine.subscribe((context) => {
  // Track individual nodes
  for (const [nodeId, state] of context.nodeStates) {
    if (state.status === 'working') {
      console.log(`Node ${nodeId} is executing...`)
    }
    if (state.status === 'completed') {
      console.log(`Node ${nodeId} finished:`, state.output)
    }
    if (state.status === 'error') {
      console.error(`Node ${nodeId} failed:`, state.error)
    }
  }
})
```

## Advanced Features

### 1. **Automatic Retries**

Failed nodes are automatically retried up to 3 times:

```typescript
// Execution flow:
// 1. Node fails (network error)
// 2. Status: 'pending' (retry 1)
// 3. Node fails again
// 4. Status: 'pending' (retry 2)
// 5. Node succeeds or fails permanently
```

### 2. **Deadlock Detection**

The engine detects when execution is stuck:

```typescript
// Scenario: Node waiting for input that will never arrive
// Engine checks:
// - Are nodes pending?
// - Are there no active tokens?
// - Are there no signals?
// → Deadlock! Stop execution.
```

### 3. **Input Interpolation Pipeline**

Before execution, inputs go through a pipeline:

```typescript
// 1. Collect inputs from edges
const inputs = {
  prompt: '{{node1.output.text}}',
  model: 'openai',
}

// 2. Interpolate placeholders
const interpolated = Interpolator.interpolate(inputs, context)
// Result: { prompt: 'Hello World', model: 'openai' }

// 3. Validate against schema
const validated = schema.safeParse(interpolated.value)
// Ensures type safety

// 4. Execute
const result = await processor.execute(validated.data, config, context)
```

### 4. **History & Time-Travel**

Every node execution is recorded:

```typescript
const context = engine.getContext()

// View execution history
context.history.forEach((snapshot) => {
  console.log(`${snapshot.timestamp}: Node ${snapshot.nodeId} ${snapshot.action}`)
})

// Example output:
// 1234567890: Node start complete
// 1234567895: Node process complete
// 1234567900: Node end complete
```

## Execution States

### Node States

- **pending** — Waiting for inputs
- **ready** — Inputs available, will execute on next tick
- **working** — Currently executing
- **completed** — Finished successfully
- **error** — Failed after retries
- **skipped** — Bypassed (dead-end branch)

### Graph States

- **idle** — Not started
- **running** — Actively executing
- **paused** — Temporarily stopped
- **completed** — All nodes finished
- **failed** — Unrecoverable error

## Performance Considerations

### 1. **Tick Interval**

```typescript
// Fast ticks (25ms) - More responsive, higher CPU
new GraphEngine(graph, { tickInterval: 25 })

// Slow ticks (100ms) - Less CPU, slower response
new GraphEngine(graph, { tickInterval: 100 })
```

### 2. **Concurrent Execution**

```typescript
// More parallelism (faster, more memory)
new GraphEngine(graph, { maxConcurrent: 10 })

// Less parallelism (slower, less memory)
new GraphEngine(graph, { maxConcurrent: 1 })
```

### 3. **Loop Safety**

```typescript
// Prevent infinite loops
new GraphEngine(graph, {
  maxLoopIterations: 20, // Max 20 times through a loop
})
```

## Integration with UI

### React Hook Example

```typescript
function useGraphExecution(graph: GraphDefinition) {
  const [context, setContext] = useState<ExecutionContext>()
  const engineRef = useRef<GraphEngine>()

  useEffect(() => {
    const engine = new GraphEngine(graph, {
      autoStart: false,
    })

    const unsubscribe = engine.subscribe(setContext)

    engineRef.current = engine

    return () => {
      unsubscribe()
      engine.stop()
    }
  }, [graph])

  return {
    context,
    start: () => engineRef.current?.start(),
    pause: () => engineRef.current?.pause(),
    resume: () => engineRef.current?.resume(),
    stop: () => engineRef.current?.stop(),
  }
}
```

### Visual Debugging

```typescript
// Highlight active nodes in the flow editor
engine.subscribe((context) => {
  for (const [nodeId, state] of context.nodeStates) {
    const element = document.querySelector(`[data-node-id="${nodeId}"]`)

    if (state.status === 'working') {
      element?.classList.add('node-active')
    }
    if (state.status === 'completed') {
      element?.classList.add('node-completed')
    }
  }
})
```

## Error Handling

### Graceful Degradation

```typescript
// If a node fails:
// 1. Error is captured in state.error
// 2. Automatic retry (up to 3 times)
// 3. If all retries fail, mark as 'error'
// 4. Downstream nodes waiting for this output will deadlock
// 5. Engine detects deadlock and stops

// To handle errors gracefully:
// - Use Router nodes to check for null outputs
// - Use error output handles
// - Set retry limits per node
```

## Testing

```typescript
import { GraphEngine } from './GraphEngine'
import { registerBuiltInNodes } from './nodes'

describe('GraphEngine', () => {
  beforeEach(() => {
    registerBuiltInNodes()
  })

  it('should execute a simple graph', async () => {
    const graph = {
      nodes: [
        { id: 'start', type: 'llm-agent', config: {} },
      ],
      edges: [],
    }

    const engine = new GraphEngine(graph)

    await new Promise((resolve) => {
      engine.subscribe((context) => {
        if (context.status === 'completed') {
          expect(context.nodeStates.get('start')?.status).toBe('completed')
          resolve()
        }
      })
    })
  })
})
```

## Future Enhancements

- [ ] Loop node type (explicit loops)
- [ ] Barrier node (wait for N inputs)
- [ ] Conditional edges (route based on output)
- [ ] Sub-graphs (nested workflows)
- [ ] Streaming execution (real-time output)
- [ ] Distributed execution (multi-machine)

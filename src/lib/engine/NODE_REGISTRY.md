# Node Registry System

The Dynamic Node Registry enables hot-swappable, extensible node types for the AETHER_OS execution engine.

## Architecture

```
┌─────────────────────────────────────┐
│   NodeContract                      │
│   - type, name, description         │
│   - inputSchema (Zod)               │
│   - outputSchema (Zod)              │
│   - UI metadata                     │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   NodeProcessor                     │
│   - isReady()                       │
│   - execute()                       │
│   - validateConfig()                │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   NodeDefinition                    │
│   = Contract + Processor            │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   NodeRegistry                      │
│   - register()                      │
│   - get(), getByCategory()          │
│   - subscribe() (reactive)          │
└─────────────────────────────────────┘
```

## Core Concepts

### 1. **NodeContract** — The Blueprint

Defines what a node _is_ and what it _needs_.

```typescript
const MyContract: NodeContract = {
  type: 'my-custom-node',
  name: 'My Custom Node',
  description: 'Does something awesome',
  category: 'agent',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.string(),
  requiredSecrets: ['API_KEY'],
  defaultConfig: { temperature: 0.7 },
  ui: {
    icon: 'star',
    color: '#f59e0b',
  },
}
```

### 2. **NodeProcessor** — The Brain

Implements the actual execution logic.

```typescript
class MyProcessor implements NodeProcessor {
  isReady(inputs: Record<string, unknown>): boolean {
    return typeof inputs.text === 'string'
  }

  async execute(inputs, config, context): Promise<string> {
    // Your logic here
    return `Processed: ${inputs.text}`
  }
}
```

### 3. **NodeDefinition** — Contract + Processor

```typescript
const MyNode: NodeDefinition = {
  contract: MyContract,
  processor: new MyProcessor(),
}
```

### 4. **NodeRegistry** — The Registry (Singleton)

```typescript
import { nodeRegistry } from './NodeRegistry'

// Register a node
nodeRegistry.register(MyNode)

// Get a node
const node = nodeRegistry.get('my-custom-node')

// Get all agent nodes
const agents = nodeRegistry.getByCategory('agent')

// Subscribe to changes
const unsubscribe = nodeRegistry.subscribe(() => {
  console.log('Registry updated!')
})
```

## Built-in Node Types

### 🧠 LLM Agent Node

Sends prompts to AI models.

**Inputs:**

- `prompt` (string)
- `systemPrompt` (optional string)
- `model` (optional string)
- `temperature` (optional number)

**Output:**

- `string` - AI response

**Example:**

```typescript
{
  prompt: "Explain quantum computing",
  systemPrompt: "You are a physics teacher",
  temperature: 0.7
}
```

### 🔀 Router Node

Evaluates conditions and routes data.

**Inputs:**

- `value` (any)
- `condition` (equals | greater_than | less_than | contains | exists)
- `compareValue` (optional any)

**Output:**

```typescript
{
  result: boolean,
  route: 'true' | 'false',
  value: any
}
```

**Example:**

```typescript
{
  value: 42,
  condition: "greater_than",
  compareValue: 30
}
// Output: { result: true, route: "true", value: 42 }
```

### 👤 Human Approval Node

Pauses execution for human input.

**Inputs:**

- `message` (string)
- `data` (any)
- `requiresInput` (optional boolean)

**Output:**

```typescript
{
  approved: boolean,
  userInput?: string,
  data: any
}
```

## Creating Custom Nodes

### Example: Weather Fetcher Node

```typescript
import { z } from 'zod'

// 1. Define schemas
const WeatherInputSchema = z.object({
  city: z.string(),
  units: z.enum(['celsius', 'fahrenheit']).optional(),
})

const WeatherOutputSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
})

// 2. Create contract
const WeatherContract: NodeContract = {
  type: 'weather-fetcher',
  name: 'Weather Fetcher',
  description: 'Fetch current weather for a city',
  category: 'tool',
  inputSchema: WeatherInputSchema,
  outputSchema: WeatherOutputSchema,
  requiredSecrets: ['WEATHER_API_KEY'],
  ui: {
    icon: 'cloud',
    color: '#06b6d4',
  },
}

// 3. Implement processor
class WeatherProcessor implements NodeProcessor {
  isReady(inputs: Record<string, unknown>): boolean {
    return typeof inputs.city === 'string'
  }

  async execute(inputs, config, context): Promise<any> {
    const apiKey = context.environment.get('WEATHER_API_KEY')
    const response = await fetch(`https://api.weather.com/${inputs.city}?key=${apiKey}`)
    return response.json()
  }
}

// 4. Register
nodeRegistry.register({
  contract: WeatherContract,
  processor: new WeatherProcessor(),
})
```

## Dynamic Registration (MCP-style)

The registry supports runtime node generation, perfect for MCP servers:

```typescript
function registerMCPTool(mcpTool: MCPToolDefinition) {
  // Generate contract from MCP schema
  const contract: NodeContract = {
    type: `mcp-${mcpTool.name}`,
    name: mcpTool.name,
    description: mcpTool.description,
    category: 'tool',
    inputSchema: generateZodSchema(mcpTool.parameters),
    outputSchema: z.unknown(),
  }

  // Generic processor
  class MCPProcessor implements NodeProcessor {
    async execute(inputs) {
      return await callMCPTool(mcpTool.name, inputs)
    }
    isReady() {
      return true
    }
  }

  nodeRegistry.register({
    contract,
    processor: new MCPProcessor(),
  })
}
```

## Factory Pattern (Stateful Nodes)

For nodes that need unique instances:

```typescript
const counterFactory = () => {
  let count = 0
  return {
    isReady: () => true,
    execute: async () => ({ count: ++count }),
  }
}

nodeRegistry.register(CounterNode, counterFactory)

// Each call creates a new instance
const p1 = nodeRegistry.getProcessor('counter') // count starts at 0
const p2 = nodeRegistry.getProcessor('counter') // separate instance
```

## Reactive Updates

Subscribe to registry changes for UI updates:

```typescript
const NodePalette = () => {
  const [nodes, setNodes] = useState([])

  useEffect(() => {
    const unsubscribe = nodeRegistry.subscribe(() => {
      setNodes(nodeRegistry.getAll())
    })
    return unsubscribe
  }, [])

  return (
    <div>
      {nodes.map(node => (
        <NodeCard key={node.contract.type} node={node} />
      ))}
    </div>
  )
}
```

## Categories

- **agent** — AI/LLM reasoning nodes
- **tool** — External API calls, file I/O
- **logic** — Routers, conditions, loops
- **human** — Human-in-the-loop nodes
- **custom** — User-defined nodes

## Best Practices

1. **Use Zod for schemas** — Type safety and validation
2. **Keep processors stateless** — Use factories if state is needed
3. **Validate in `isReady()`** — Prevent execution with bad inputs
4. **Use `requiredSecrets`** — Document environment dependencies
5. **Provide UI metadata** — Icon, color, handle labels

## Integration with Execution Engine

The registry is used by the Graph Engine to:

1. **Validate node types** — Ensure all nodes in a graph exist
2. **Get processors** — Instantiate execution logic
3. **Validate connections** — Check input/output schema compatibility
4. **Generate UI** — Render nodes with correct icons/colors

## Testing

```typescript
import { nodeRegistry } from './NodeRegistry'
import { MyNode } from './nodes/MyNode'

describe('MyNode', () => {
  beforeEach(() => {
    nodeRegistry.clear()
    nodeRegistry.register(MyNode)
  })

  it('should be registered', () => {
    expect(nodeRegistry.has('my-node')).toBe(true)
  })

  it('should execute', async () => {
    const processor = nodeRegistry.getProcessor('my-node')
    const result = await processor.execute({ input: 'test' }, {}, mockContext)
    expect(result).toBe('expected output')
  })
})
```

## Future Enhancements

- [ ] Node versioning (v1, v2)
- [ ] Migration helpers for breaking changes
- [ ] Visual node editor integration
- [ ] Node marketplace (import from URL)
- [ ] Hot reload during development

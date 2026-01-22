# Graph Execution Engine

The core execution system for AETHER_OS agent workflows.

## Components

### 📝 Types (`types.ts`)

Core TypeScript types for the execution engine:

- **ExecutionContext** - Global state of a workflow run
- **NodeExecutionState** - State of individual nodes
- **InterpolationResult** - Result of variable resolution
- **ValidationResult** - Result of Zod schema validation

### 🔄 Interpolator (`Interpolator.ts`)

The **Universal Translator** - handles dynamic variable interpolation, type coercion, and schema validation.

#### Features:

1. **Variable Interpolation**
   - `{{NodeID.output}}` - Reference node outputs
   - `{{NodeID.output.nested.field}}` - Access nested fields
   - `{{$env.API_KEY}}` - Environment variables
   - `{{$global.variable}}` - Global memory scope

2. **Type-Aware Coercion**
   - CSV string → Array: `"a,b,c"` → `["a", "b", "c"]`
   - JSON string → Object: `'{"x":1}'` → `{x: 1}`
   - String → Number: `"42"` → `42`
   - String → Boolean: `"true"` → `true`

3. **JIT Schema Validation**
   - Zod-based validation before node execution
   - Clear error messages for type mismatches
   - Automatic transformation

#### Usage:

```typescript
import { Interpolator } from './Interpolator'
import { z } from 'zod'

// Simple interpolation
const result = Interpolator.interpolate(
  '{{node1.output}}',
  executionContext
)

// Full pipeline (interpolate → coerce → validate)
const schema = z.object({ name: z.string() })
const processed = Interpolator.process(
  '{{node1.output}}',
  schema,
  executionContext
)
```

#### Example:

```typescript
// Given:
// - node1.output = { message: "Hello", count: 42 }
// - $env.API_KEY = "sk-123"
// - $global.userName = "Alice"

const template = {
  user: '{{$global.userName}}',
  apiKey: '{{$env.API_KEY}}',
  greeting: '{{node1.output.message}}',
  count: '{{node1.output.count}}'
}

const result = Interpolator.interpolate(template, context)

// Result:
// {
//   user: "Alice",
//   apiKey: "sk-123",
//   greeting: "Hello",
//   count: "42" (string)
// }
```

## Architecture

```
┌─────────────────────────────────────┐
│   ExecutionContext                  │
│   ┌───────────────────────────┐     │
│   │ memory (global vars)      │     │
│   │ nodeStates (outputs)      │     │
│   │ environment ($env.*)      │     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   Interpolator.process()            │
│                                     │
│   1. Interpolate placeholders       │
│      {{NodeID.output}} → value      │
│                                     │
│   2. Coerce types                   │
│      "42" → 42 (if schema=number)   │
│                                     │
│   3. Validate with Zod              │
│      Ensure data matches schema     │
│                                     │
└─────────────────────────────────────┘
                │
                ▼
         ✅ Ready for Node Execution
```

## Error Handling

The Interpolator provides detailed error information:

- **missing_dependency** - Referenced node hasn't completed
- **type_mismatch** - Data doesn't match expected type (after coercion)
- **validation_error** - Zod schema validation failed
- **syntax_error** - Invalid placeholder syntax

Example error:

```typescript
{
  path: "node2.output",
  message: "Node \"node2\" not found in execution context",
  type: "missing_dependency"
}
```

## Testing

Run tests with:

```bash
npm test -- interpolator.test.ts
```

## Integration

The Interpolator is used by the Graph Execution Engine to:

1. **Pre-process node inputs** - Resolve placeholders before execution
2. **Validate data flow** - Ensure type safety at edges
3. **Enable dynamic workflows** - Reference previous outputs automatically

## Future Enhancements

- [ ] Custom coercion functions per node type
- [ ] Support for array indexing (`{{node1.output[0]}}`)
- [ ] Support for filtering (`{{node1.output|filter:active}}`)
- [ ] Caching of resolved paths for performance

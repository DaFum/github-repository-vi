/**
 * Node Registry Usage Examples
 *
 * This file demonstrates how to use the Node Registry system.
 */

import { z } from 'zod'
import { nodeRegistry } from './NodeRegistry'
import type { NodeContract, NodeProcessor, NodeDefinition } from './NodeContract'
import type { ExecutionContext } from './types'
import { registerBuiltInNodes } from './nodes'

// ============================================
// Example 1: Using Built-in Nodes
// ============================================

export function example1_UsingBuiltInNodes() {
  // Register all built-in nodes
  registerBuiltInNodes()

  // List all registered nodes
  console.log('All nodes:', nodeRegistry.export())

  // Get a specific node
  const llmNode = nodeRegistry.get('llm-agent')
  console.log('LLM Node:', llmNode?.contract.name)

  // Get nodes by category
  const agentNodes = nodeRegistry.getByCategory('agent')
  console.log(
    'Agent nodes:',
    agentNodes.map((n) => n.contract.name)
  )

  // Search for nodes
  const results = nodeRegistry.search('router')
  console.log(
    'Search results:',
    results.map((n) => n.contract.name)
  )
}

// ============================================
// Example 2: Creating a Custom Node
// ============================================

// Step 1: Define schemas
const CustomNodeInputSchema = z.object({
  text: z.string(),
  multiplier: z.number().default(1),
})

type CustomNodeInput = z.infer<typeof CustomNodeInputSchema>

const CustomNodeOutputSchema = z.string()

type CustomNodeOutput = z.infer<typeof CustomNodeOutputSchema>

// Step 2: Create contract
const CustomNodeContract: NodeContract<CustomNodeInput, CustomNodeOutput> = {
  type: 'custom-repeater',
  name: 'Text Repeater',
  description: 'Repeats input text N times',
  category: 'custom',
  inputSchema: CustomNodeInputSchema,
  outputSchema: CustomNodeOutputSchema,
  defaultConfig: {
    multiplier: 3,
  },
  ui: {
    icon: 'repeat',
    color: '#10b981',
    handles: {
      inputs: [
        { id: 'text', label: 'Text', type: 'string' },
        { id: 'multiplier', label: 'Count', type: 'number' },
      ],
      outputs: [{ id: 'output', label: 'Result', type: 'string' }],
    },
  },
}

// Step 3: Implement processor
class CustomNodeProcessor implements NodeProcessor<CustomNodeInput, CustomNodeOutput> {
  isReady(inputs: Record<string, unknown>, _config: Record<string, unknown>): boolean {
    return typeof inputs.text === 'string'
  }

  async execute(
    inputs: CustomNodeInput,
    config: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<CustomNodeOutput> {
    const count = inputs.multiplier || (config.multiplier as number) || 1
    return inputs.text.repeat(count)
  }
}

// Step 4: Create definition
const CustomNode: NodeDefinition<CustomNodeInput, CustomNodeOutput> = {
  contract: CustomNodeContract,
  processor: new CustomNodeProcessor(),
}

// Step 5: Register
export function example2_RegisterCustomNode() {
  nodeRegistry.register(CustomNode)
  console.log('Custom node registered!')
}

// ============================================
// Example 3: Runtime Node Registration (MCP-style)
// ============================================

export function example3_DynamicRegistration() {
  // Simulate an MCP server exposing a new tool
  const mcpToolSchema = {
    name: 'fetch_weather',
    description: 'Fetch weather data for a city',
    parameters: {
      city: 'string',
      units: 'celsius | fahrenheit',
    },
  }

  // Dynamically generate a node contract
  const contract: NodeContract = {
    type: `mcp-tool-${mcpToolSchema.name}`,
    name: mcpToolSchema.name.replace(/_/g, ' ').toUpperCase(),
    description: mcpToolSchema.description,
    category: 'tool',
    inputSchema: z.object({
      city: z.string(),
      units: z.enum(['celsius', 'fahrenheit']).optional(),
    }),
    outputSchema: z.unknown(),
    ui: {
      icon: 'cloud',
      color: '#06b6d4',
    },
  }

  // Create a generic processor
  class MCPToolProcessor implements NodeProcessor {
    isReady(inputs: Record<string, unknown>): boolean {
      return 'city' in inputs
    }

    async execute(
      inputs: unknown,
      _config: Record<string, unknown>,
      _context: ExecutionContext
    ): Promise<unknown> {
      // In reality, this would call the MCP tool
      console.log('Calling MCP tool:', mcpToolSchema.name, 'with', inputs)
      return { temperature: 22, condition: 'sunny' }
    }
  }

  // Register the dynamically generated node
  const definition: NodeDefinition = {
    contract,
    processor: new MCPToolProcessor(),
  }

  nodeRegistry.register(definition)
  console.log('Dynamic MCP tool registered:', contract.type)
}

// ============================================
// Example 4: Subscribe to Registry Changes
// ============================================

export function example4_SubscribeToChanges() {
  const unsubscribe = nodeRegistry.subscribe(() => {
    console.log('Registry changed! Total nodes:', nodeRegistry.size)
    console.log('Available:', nodeRegistry.export())
  })

  // Register a new node (triggers listener)
  example2_RegisterCustomNode()

  // Cleanup
  setTimeout(() => {
    unsubscribe()
    console.log('Unsubscribed from registry changes')
  }, 1000)
}

// ============================================
// Example 5: Using Factories for Stateful Nodes
// ============================================

export function example5_UsingFactories() {
  let instanceCounter = 0

  // Factory function
  const createProcessor = () => {
    const instanceId = ++instanceCounter
    console.log('Creating processor instance:', instanceId)

    return {
      isReady: () => true,
      execute: async () => {
        return `Response from instance ${instanceId}`
      },
    }
  }

  // Register with factory
  nodeRegistry.register(CustomNode, createProcessor)

  // Each time we get the processor, a new instance is created
  const processor1 = nodeRegistry.getProcessor('custom-repeater')
  const processor2 = nodeRegistry.getProcessor('custom-repeater')

  console.log('Processor 1:', processor1)
  console.log('Processor 2:', processor2)
  console.log('Same instance?', processor1 === processor2) // false (different instances)
}

// ============================================
// Run all examples
// ============================================

export function runAllExamples() {
  console.log('\n=== Example 1: Using Built-in Nodes ===')
  example1_UsingBuiltInNodes()

  console.log('\n=== Example 2: Register Custom Node ===')
  example2_RegisterCustomNode()

  console.log('\n=== Example 3: Dynamic Registration ===')
  example3_DynamicRegistration()

  console.log('\n=== Example 4: Subscribe to Changes ===')
  example4_SubscribeToChanges()

  console.log('\n=== Example 5: Using Factories ===')
  example5_UsingFactories()
}

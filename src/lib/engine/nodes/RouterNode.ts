import { z } from 'zod'
import type { NodeContract, NodeProcessor, NodeDefinition } from '../NodeContract'
import type { ExecutionContext } from '../types'

/**
 * Router Node
 *
 * Evaluates a condition and routes data to different outputs based on the result.
 * Supports simple comparisons without eval() for security.
 */

// Input schema
const RouterInputSchema = z.object({
  value: z.unknown(),
  condition: z.enum(['equals', 'greater_than', 'less_than', 'contains', 'exists']),
  compareValue: z.unknown().optional(),
})

type RouterInput = z.infer<typeof RouterInputSchema>

// Output schema (includes routing decision)
const RouterOutputSchema = z.object({
  result: z.boolean(),
  route: z.enum(['true', 'false']),
  value: z.unknown(),
})

type RouterOutput = z.infer<typeof RouterOutputSchema>

// Contract
export const RouterContract: NodeContract<RouterInput, RouterOutput> = {
  type: 'router',
  name: 'Router',
  description: 'Evaluate a condition and route data based on the result',
  category: 'logic',
  inputSchema: RouterInputSchema,
  outputSchema: RouterOutputSchema,
  defaultConfig: {
    condition: 'exists',
  },
  ui: {
    icon: 'arrows-split',
    color: '#f59e0b',
    handles: {
      inputs: [
        { id: 'value', label: 'Value', type: 'any' },
        { id: 'compareValue', label: 'Compare To', type: 'any' },
      ],
      outputs: [
        { id: 'true', label: 'True Path', type: 'any' },
        { id: 'false', label: 'False Path', type: 'any' },
      ],
    },
  },
}

// Processor
export class RouterProcessor implements NodeProcessor<RouterInput, RouterOutput> {
  isReady(inputs: Record<string, unknown>): boolean {
    return 'value' in inputs && 'condition' in inputs
  }

  async execute(
    inputs: RouterInput,
    _config: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<RouterOutput> {
    const { value, condition, compareValue } = inputs

    let result: boolean

    switch (condition) {
      case 'equals':
        result = value === compareValue
        break

      case 'greater_than':
        if (typeof value === 'number' && typeof compareValue === 'number') {
          result = value > compareValue
        } else {
          result = false
        }
        break

      case 'less_than':
        if (typeof value === 'number' && typeof compareValue === 'number') {
          result = value < compareValue
        } else {
          result = false
        }
        break

      case 'contains':
        if (typeof value === 'string' && typeof compareValue === 'string') {
          result = value.includes(compareValue)
        } else if (Array.isArray(value)) {
          result = value.includes(compareValue)
        } else {
          result = false
        }
        break

      case 'exists':
        result = value !== null && value !== undefined
        break

      default:
        result = false
    }

    return {
      result,
      route: result ? 'true' : 'false',
      value,
    }
  }
}

// Definition
export const RouterNode: NodeDefinition<RouterInput, RouterOutput> = {
  contract: RouterContract,
  processor: new RouterProcessor(),
}

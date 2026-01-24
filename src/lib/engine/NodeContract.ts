import { z } from 'zod'
import type { ExecutionContext } from './types'

/**
 * The "Behavioral Contract" for a Node
 *
 * Every node type must define what it needs, what it produces,
 * and what permissions it requires.
 */
export interface NodeContract<TInput = unknown, TOutput = unknown> {
  // Unique identifier for this node type
  type: string

  // Human-readable name
  name: string

  // Description of what this node does
  description: string

  // Category for UI grouping
  category: 'agent' | 'tool' | 'logic' | 'human' | 'custom'

  // Input schema (Zod)
  inputSchema: z.ZodType<TInput>

  // Output schema (Zod)
  outputSchema: z.ZodType<TOutput>

  // Environment variables required (e.g., ["API_KEY"])
  requiredSecrets?: string[]

  // Default configuration
  defaultConfig?: Record<string, unknown>

  // UI Component metadata
  ui?: {
    icon?: string
    color?: string
    handles?: {
      inputs?: Array<{ id: string; label: string; type?: string }>
      outputs?: Array<{ id: string; label: string; type?: string }>
    }
  }
}

/**
 * The Node Processor Interface
 *
 * Every node type must implement this to define its execution logic.
 */
export interface NodeProcessor<TInput = unknown, TOutput = unknown> {
  /**
   * Check if this node is ready to execute
   * (all required inputs are present)
   */
  isReady(inputs: Record<string, unknown>, config: Record<string, unknown>): boolean

  /**
   * Execute the node's logic
   */
  execute(
    inputs: TInput,
    config: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<TOutput>

  /**
   * Optional: Validate configuration before execution
   */
  validateConfig?(config: Record<string, unknown>): boolean
}

/**
 * Complete Node Definition
 * (Contract + Processor)
 */
export interface NodeDefinition<TInput = unknown, TOutput = unknown> {
  contract: NodeContract<TInput, TOutput>
  processor: NodeProcessor<TInput, TOutput>
}

/**
 * Factory function signature for creating node processors
 */
export type NodeFactory<TInput = unknown, TOutput = unknown> = () => NodeProcessor<TInput, TOutput>

import { NodeProcessor, ExecutionContext, NodeDefinition } from './types'
import { pollinations } from '@/lib/pollinations'
import { compileExpression } from 'filtrex'
import { z } from 'zod'

/**
 * Processor for Agent nodes, handling AI interactions.
 */
export class AgentProcessor implements NodeProcessor {
  isReady(_inputs: Record<string, unknown>, _config: unknown): boolean {
    // Agents generally need a prompt or user input
    return true
  }

  /**
   * Executes the agent logic using Pollinations API.
   */
  async execute(
    _inputs: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    _context: ExecutionContext
  ): Promise<unknown> {
    const prompt = config.prompt || 'Explain quantum computing'

    // Call Pollinations
    const response = await pollinations.chat(
      [
        { role: 'system', content: config.systemPrompt || 'You are a helpful agent.' },
        { role: 'user', content: prompt },
      ],
      { model: config.model || 'openai' }
    )

    return { text: response }
  }
}

/**
 * Processor for Logic nodes, handling expression evaluation.
 */
export class LogicProcessor implements NodeProcessor {
  isReady(_inputs: Record<string, unknown>, _config: unknown): boolean {
    return true
  }

  /**
   * Executes the logic expression using Filtrex.
   */
  async execute(
    inputs: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    _context: ExecutionContext
  ): Promise<unknown> {
    if (config?.expression) {
      try {
        const myFilter = compileExpression(config.expression)
        return myFilter(inputs)
      } catch (error) {
        console.error('Filtrex execution failed:', error)
        throw new Error(
          `Logic execution failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
    return inputs // Pass-through if no expression
  }
}

/**
 * Registry for managing node types and their processors.
 */
export class NodeRegistry {
  private static processors: Map<string, NodeProcessor> = new Map()
  private static definitions: Map<string, NodeDefinition> = new Map()

  /**
   * Registers a new node type.
   * @param type The unique identifier for the node type.
   * @param processor The processor instance for execution logic.
   * @param definition The schema definition for the node.
   */
  static register(type: string, processor: NodeProcessor, definition?: NodeDefinition) {
    this.processors.set(type, processor)
    if (definition) {
      this.definitions.set(type, definition)
    }
  }

  /**
   * Retrieves the processor for a given node type.
   * @param type The node type identifier.
   * @returns The registered processor or a default LogicProcessor.
   */
  static get(type: string): NodeProcessor {
    return this.processors.get(type) || new LogicProcessor() // Default
  }

  /**
   * Retrieves the definition for a given node type.
   * @param type The node type identifier.
   * @returns The node definition or undefined if not found.
   */
  static getDefinition(type: string): NodeDefinition | undefined {
    return this.definitions.get(type)
  }
}

// --- Default Definitions ---

const AgentDefinition: NodeDefinition = {
  type: 'agent',
  label: 'AI Agent',
  inputs: z.object({
    input: z.string().optional(),
  }),
  outputs: z.object({
    text: z.string(),
  }),
}

const TriggerDefinition: NodeDefinition = {
  type: 'trigger',
  label: 'Trigger',
  inputs: z.object({}),
  outputs: z.object({
    data: z.any(),
  }),
}

// Register default processors
NodeRegistry.register('agent', new AgentProcessor(), AgentDefinition)
NodeRegistry.register('trigger', new LogicProcessor(), TriggerDefinition)
NodeRegistry.register('tool', new LogicProcessor()) // Mock for now

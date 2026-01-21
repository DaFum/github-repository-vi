import { NodeProcessor, ExecutionContext, NodeDefinition } from './types'
import { pollinations } from '@/lib/pollinations'
// import { compileExpression } from 'filtrex'; // Uncomment when implemented
import { z } from 'zod'

export class AgentProcessor implements NodeProcessor {
  isReady(_inputs: Record<string, unknown>, _config: unknown): boolean {
    // Agents generally need a prompt or user input
    return true
  }

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

export class LogicProcessor implements NodeProcessor {
  isReady(_inputs: Record<string, unknown>, _config: unknown): boolean {
    return true
  }

  async execute(
    inputs: Record<string, unknown>,
    _config: unknown,
    _context: ExecutionContext
  ): Promise<unknown> {
    // Placeholder for Filtrex logic
    // const myFilter = compileExpression(config.expression);
    // return myFilter(inputs);
    return inputs // Pass-through for now
  }
}

export class NodeRegistry {
  private static processors: Map<string, NodeProcessor> = new Map()
  private static definitions: Map<string, NodeDefinition> = new Map()

  static register(type: string, processor: NodeProcessor, definition?: NodeDefinition) {
    this.processors.set(type, processor)
    if (definition) {
      this.definitions.set(type, definition)
    }
  }

  static get(type: string): NodeProcessor {
    return this.processors.get(type) || new LogicProcessor() // Default
  }

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

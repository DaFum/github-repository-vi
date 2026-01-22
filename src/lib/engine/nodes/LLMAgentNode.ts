import { z } from 'zod'
import type { NodeContract, NodeProcessor, NodeDefinition } from '../NodeContract'
import type { ExecutionContext } from '../types'
import { pollinations } from '@/lib/pollinations'

/**
 * LLM Agent Node
 *
 * Sends a prompt to an LLM and returns the response.
 * Supports model selection, temperature control, and JSON mode.
 */

// Input schema
const LLMAgentInputSchema = z.object({
  prompt: z.string(),
  systemPrompt: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  jsonMode: z.boolean().optional(),
})

type LLMAgentInput = z.infer<typeof LLMAgentInputSchema>

// Output schema
const LLMAgentOutputSchema = z.string()

type LLMAgentOutput = z.infer<typeof LLMAgentOutputSchema>

// Contract
export const LLMAgentContract: NodeContract<LLMAgentInput, LLMAgentOutput> = {
  type: 'llm-agent',
  name: 'LLM Agent',
  description: 'Send a prompt to an AI model and get a text response',
  category: 'agent',
  inputSchema: LLMAgentInputSchema,
  outputSchema: LLMAgentOutputSchema,
  requiredSecrets: ['POLLINATIONS_API_KEY'],
  defaultConfig: {
    model: 'openai',
    temperature: 0.7,
    jsonMode: false,
  },
  ui: {
    icon: 'brain',
    color: '#60a5fa',
    handles: {
      inputs: [
        { id: 'prompt', label: 'Prompt', type: 'string' },
        { id: 'systemPrompt', label: 'System Prompt', type: 'string' },
      ],
      outputs: [{ id: 'output', label: 'Response', type: 'string' }],
    },
  },
}

// Processor
export class LLMAgentProcessor implements NodeProcessor<LLMAgentInput, LLMAgentOutput> {
  isReady(inputs: Record<string, unknown>): boolean {
    return typeof inputs.prompt === 'string' && inputs.prompt.trim().length > 0
  }

  async execute(
    inputs: LLMAgentInput,
    config: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<LLMAgentOutput> {
    const messages = []

    // Add system prompt if provided
    if (inputs.systemPrompt) {
      messages.push({
        role: 'system' as const,
        content: inputs.systemPrompt,
      })
    }

    // Add user prompt
    messages.push({
      role: 'user' as const,
      content: inputs.prompt,
    })

    // Call Pollinations API
    const response = await pollinations.chat(messages, {
      model: (inputs.model || config.model || 'openai') as string,
      temperature: (inputs.temperature ?? config.temperature ?? 0.7) as number,
      jsonMode: (inputs.jsonMode ?? config.jsonMode ?? false) as boolean,
    })

    return response
  }

  validateConfig(config: Record<string, unknown>): boolean {
    if (config.temperature !== undefined) {
      const temp = config.temperature as number
      if (temp < 0 || temp > 2) return false
    }
    return true
  }
}

// Definition
export const LLMAgentNode: NodeDefinition<LLMAgentInput, LLMAgentOutput> = {
  contract: LLMAgentContract,
  processor: new LLMAgentProcessor(),
}

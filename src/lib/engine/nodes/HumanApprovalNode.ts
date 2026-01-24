import { z } from 'zod'
import type { NodeContract, NodeProcessor, NodeDefinition } from '../NodeContract'
import type { ExecutionContext } from '../types'

/**
 * Human Approval Node
 *
 * Pauses execution and requests human approval/input.
 * The execution engine must handle the 'waiting_for_user' state.
 */

// Input schema
const HumanApprovalInputSchema = z.object({
  message: z.string(),
  data: z.unknown(),
  requiresInput: z.boolean().optional(),
  inputLabel: z.string().optional(),
})

type HumanApprovalInput = z.infer<typeof HumanApprovalInputSchema>

// Output schema
const HumanApprovalOutputSchema = z.object({
  approved: z.boolean(),
  userInput: z.string().optional(),
  data: z.unknown(),
})

type HumanApprovalOutput = z.infer<typeof HumanApprovalOutputSchema>

// Contract
export const HumanApprovalContract: NodeContract<HumanApprovalInput, HumanApprovalOutput> = {
  type: 'human-approval',
  name: 'Human Approval',
  description: 'Pause execution and request human approval or input',
  category: 'human',
  inputSchema: HumanApprovalInputSchema,
  outputSchema: HumanApprovalOutputSchema,
  defaultConfig: {
    requiresInput: false,
  },
  ui: {
    icon: 'user-circle',
    color: '#8b5cf6',
    handles: {
      inputs: [
        { id: 'message', label: 'Message', type: 'string' },
        { id: 'data', label: 'Data', type: 'any' },
      ],
      outputs: [
        { id: 'approved', label: 'Approved', type: 'boolean' },
        { id: 'data', label: 'Data', type: 'any' },
      ],
    },
  },
}

// Processor
export class HumanApprovalProcessor implements NodeProcessor<
  HumanApprovalInput,
  HumanApprovalOutput
> {
  isReady(inputs: Record<string, unknown>): boolean {
    return typeof inputs.message === 'string'
  }

  async execute(
    inputs: HumanApprovalInput,
    _config: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<HumanApprovalOutput> {
    // In a real implementation, this would:
    // 1. Store the current execution state
    // 2. Emit an event to show a UI dialog
    // 3. Wait for the user's response
    // 4. Resume execution with the response

    // For now, we return a placeholder
    // The execution engine will detect this special output
    // and handle the suspension logic

    return new Promise((resolve) => {
      // This would be replaced by actual UI interaction logic
      // For demonstration, we'll auto-approve after a delay
      setTimeout(() => {
        resolve({
          approved: true,
          userInput: inputs.requiresInput ? 'User input placeholder' : undefined,
          data: inputs.data,
        })
      }, 100)
    })
  }
}

// Definition
export const HumanApprovalNode: NodeDefinition<HumanApprovalInput, HumanApprovalOutput> = {
  contract: HumanApprovalContract,
  processor: new HumanApprovalProcessor(),
}

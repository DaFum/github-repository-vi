/**
 * Standard result structure for agent operations.
 */
export interface AgentResult {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Interface defining the structure of a specialized agent.
 * @template TPayload The type of the input payload.
 * @template TResult The type of the result returned by the agent.
 */
export interface SpecializedAgent<TPayload = unknown, TResult = unknown> {
  /**
   * Executes the agent's logic.
   * @param payload The input data for the agent.
   * @returns A promise that resolves to the agent's result.
   */
  execute(payload: TPayload): Promise<TResult>
}

export interface AgentResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface SpecializedAgent<TPayload = unknown, TResult = unknown> {
  execute(payload: TPayload): Promise<TResult>
}

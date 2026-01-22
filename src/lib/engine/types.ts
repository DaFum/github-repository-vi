import { z } from 'zod'

/**
 * The Global Execution Context
 * This is the "God View" of a single workflow run
 */
export type ExecutionContext = {
  runId: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  memory: Map<string, unknown> // Global "Blackboard" variables
  nodeStates: Map<string, NodeExecutionState> // State of every node
  edgeSignals: Map<string, unknown> // Data sitting on "wires" waiting to be consumed
  history: ExecutionSnapshot[] // For time-travel debugging
  environment: Map<string, unknown> // Environment variables ($env.*)
}

/**
 * The State of a Single Node
 */
export type NodeExecutionState = {
  id: string
  status: 'pending' | 'ready' | 'working' | 'completed' | 'error' | 'skipped'
  inputBuffer: Record<string, unknown> // Inputs collected so far
  output: unknown | null // The result produced
  error: Error | null
  startTime: number
  endTime: number
  logs: LogEntry[] // Console logs specific to this node
  retryCount: number // For resilience
  executionVersion: number // For loop support
}

/**
 * Log Entry
 */
export type LogEntry = {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

/**
 * Execution Snapshot (for time-travel)
 */
export type ExecutionSnapshot = {
  timestamp: number
  nodeId: string
  action: 'start' | 'complete' | 'error'
  state: Partial<NodeExecutionState>
}

/**
 * Interpolation Result
 */
export type InterpolationResult = {
  value: unknown
  success: boolean
  errors: InterpolationError[]
  dependencies: string[] // List of node IDs this value depends on
}

/**
 * Interpolation Error
 */
export type InterpolationError = {
  path: string
  message: string
  type: 'missing_dependency' | 'type_mismatch' | 'validation_error' | 'syntax_error'
}

/**
 * Validation Result
 */
export type ValidationResult = {
  valid: boolean
  errors: z.ZodIssue[]
  transformed?: unknown
}

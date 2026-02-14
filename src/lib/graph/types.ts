import { z } from 'zod'

// --- Data Structures ---

/**
 * Schema for data lineage and provenance tracking.
 */
export const ProvenanceSchema = z.object({
  generatedBy: z.string(), // Node ID
  source: z.array(z.string()), // Source Node IDs
  timestamp: z.number(),
  meta: z.record(z.unknown()).optional(),
})

export type Provenance = z.infer<typeof ProvenanceSchema>

/**
 * Schema for execution logs.
 */
export const LogEntrySchema = z.object({
  timestamp: z.number(),
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  data: z.unknown().optional(),
})

export type LogEntry = z.infer<typeof LogEntrySchema>

/**
 * Schema representing the runtime state of a single node.
 */
export const NodeExecutionStateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'ready', 'working', 'completed', 'error', 'skipped']),
  inputBuffer: z.record(z.unknown()), // Inputs collected so far
  output: z.unknown().nullable(), // The result produced
  outputProvenance: ProvenanceSchema.optional(), // Metadata about the output
  error: z.unknown().nullable(), // Error object or message
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  logs: z.array(LogEntrySchema),
  retryCount: z.number().default(0),
})

export type NodeExecutionState = z.infer<typeof NodeExecutionStateSchema>

/**
 * Schema for the global graph execution context.
 */
export const ExecutionContextSchema = z.object({
  runId: z.string(),
  status: z.enum(['idle', 'running', 'paused', 'completed', 'failed']),
  memory: z.map(z.string(), z.unknown()), // Global "Blackboard" variables
  nodeStates: z.map(z.string(), NodeExecutionStateSchema), // State of every node
  edgeSignals: z.map(z.string(), z.unknown()), // Data on "wires" (EdgeId -> Data)
  history: z.array(z.unknown()), // Snapshots (simplified for now)
})

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>

// --- Definitions ---

/**
 * Definition interface for node types.
 */
export type NodeDefinition = {
  type: string
  label: string
  description?: string
  inputs: z.ZodObject<z.ZodRawShape> // Input Schema
  outputs: z.ZodObject<z.ZodRawShape> // Output Schema
  defaultConfig?: Record<string, unknown>
}

// --- Interfaces ---

/**
 * Interface for node execution logic.
 */
export interface NodeProcessor {
  isReady(inputs: Record<string, unknown>, config: unknown): boolean
  execute(
    inputs: Record<string, unknown>,
    config: unknown,
    context: ExecutionContext
  ): Promise<unknown>
}

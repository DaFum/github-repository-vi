import { z } from 'zod'

// --- Data Structures ---

export const ProvenanceSchema = z.object({
  generatedBy: z.string(), // Node ID
  source: z.array(z.string()), // Source Node IDs
  timestamp: z.number(),
  meta: z.record(z.any()).optional(),
})

export type Provenance = z.infer<typeof ProvenanceSchema>

export const LogEntrySchema = z.object({
  timestamp: z.number(),
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  data: z.any().optional(),
})

export type LogEntry = z.infer<typeof LogEntrySchema>

export const NodeExecutionStateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'ready', 'working', 'completed', 'error', 'skipped']),
  inputBuffer: z.record(z.any()), // Inputs collected so far
  output: z.any().nullable(), // The result produced
  outputProvenance: ProvenanceSchema.optional(), // Metadata about the output
  error: z.any().nullable(), // Error object or message
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  logs: z.array(LogEntrySchema),
  retryCount: z.number().default(0),
})

export type NodeExecutionState = z.infer<typeof NodeExecutionStateSchema>

export const ExecutionContextSchema = z.object({
  runId: z.string(),
  status: z.enum(['idle', 'running', 'paused', 'completed', 'failed']),
  memory: z.map(z.string(), z.any()), // Global "Blackboard" variables
  nodeStates: z.map(z.string(), NodeExecutionStateSchema), // State of every node
  edgeSignals: z.map(z.string(), z.any()), // Data on "wires" (EdgeId -> Data)
  history: z.array(z.any()), // Snapshots (simplified for now)
})

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>

// --- Definitions ---

export type NodeDefinition = {
  type: string
  label: string
  description?: string
  inputs: z.ZodObject<any> // Input Schema
  outputs: z.ZodObject<any> // Output Schema
  defaultConfig?: Record<string, any>
}

// --- Interfaces ---

export interface NodeProcessor {
  isReady(inputs: Record<string, any>, config: any): boolean
  execute(inputs: Record<string, any>, config: any, context: ExecutionContext): Promise<any>
}

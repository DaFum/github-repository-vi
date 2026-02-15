import { ExecutionContext } from './types'

/**
 * Utility for recording execution history and generating data provenance.
 */
export class HistoryRecorder {
  /**
   * Creates a snapshot of the current execution context.
   * @param context The current execution context.
   * @returns A snapshot object containing timestamp, status, and state maps.
   */
  static createSnapshot(context: ExecutionContext): unknown {
    // Simplified snapshot: clone status and node states
    // In a real system, use structural sharing (immer) for efficiency
    return {
      timestamp: Date.now(),
      status: context.status,
      nodeStates: new Map(context.nodeStates),
      edgeSignals: new Map(context.edgeSignals),
    }
  }

  /**
   * Records a history delta (snapshot) and appends it to the context history.
   * Caps the history size to 50 entries.
   * @param context The execution context to record.
   */
  static recordDelta(context: ExecutionContext) {
    const snapshot = this.createSnapshot(context)
    context.history.push(snapshot)

    // Cap history size
    if (context.history.length > 50) {
      context.history.shift()
    }
  }

  /**
   * Generates provenance metadata for a node execution.
   * Traces source nodes from inputs if available.
   * @param nodeId The ID of the node generating the output.
   * @param inputs The inputs used for execution.
   * @returns Provenance metadata object.
   */
  static generateProvenance(nodeId: string, inputs: Record<string, unknown>): unknown {
    // Trace source nodes from inputs if they contain provenance
    const sources: string[] = []

    Object.values(inputs).forEach((val) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (val && typeof val === 'object' && (val as any).provenance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sources.push((val as any).provenance.generatedBy)
      }
    })

    return {
      generatedBy: nodeId,
      source: sources,
      timestamp: Date.now(),
    }
  }
}

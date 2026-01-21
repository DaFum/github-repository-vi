import { ExecutionContext } from './types'

export class HistoryRecorder {
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

  static recordDelta(context: ExecutionContext) {
    const snapshot = this.createSnapshot(context)
    context.history.push(snapshot)

    // Cap history size
    if (context.history.length > 50) {
      context.history.shift()
    }
  }

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

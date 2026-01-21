import { ExecutionContext, NodeExecutionState } from './types'

export class HistoryRecorder {
  static createSnapshot(context: ExecutionContext): any {
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

  static generateProvenance(nodeId: string, inputs: Record<string, any>): any {
    // Trace source nodes from inputs if they contain provenance
    const sources: string[] = []

    Object.values(inputs).forEach((val) => {
      if (val && typeof val === 'object' && val.provenance) {
        sources.push(val.provenance.generatedBy)
      }
    })

    return {
      generatedBy: nodeId,
      source: sources,
      timestamp: Date.now(),
    }
  }
}

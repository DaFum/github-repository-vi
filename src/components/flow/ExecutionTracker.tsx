import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFlowStore } from '@/store/flowStore'
import { CircleNotch, CheckCircle, Warning, Clock, ArrowRight, Pulse } from '@phosphor-icons/react'
import type { NodeExecutionState } from '@/lib/engine/types'

type ExecutionTrackerProps = {
  isOpen: boolean
}

/**
 * Execution Tracker Panel
 *
 * Real-time visualization of workflow execution:
 * - Node execution status
 * - Token flow visualization
 * - Error tracking
 * - Performance metrics
 */
export function ExecutionTracker({ isOpen }: ExecutionTrackerProps) {
  const { executionContext } = useFlowStore()

  // Use nodeStates directly from executionContext (no need for separate state)
  const nodeStates = executionContext?.nodeStates || new Map<string, NodeExecutionState>()

  const getStatusIcon = (status: NodeExecutionState['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-muted-foreground" />
      case 'ready':
        return <Pulse size={16} className="animate-pulse text-blue-400" />
      case 'working':
        return <CircleNotch size={16} className="text-accent animate-spin" />
      case 'completed':
        return <CheckCircle size={16} weight="fill" className="text-green-400" />
      case 'error':
        return <Warning size={16} weight="fill" className="text-destructive" />
      case 'skipped':
        return <ArrowRight size={16} className="text-muted-foreground opacity-50" />
      default:
        return null
    }
  }

  const getStatusColor = (status: NodeExecutionState['status']) => {
    switch (status) {
      case 'pending':
        return 'border-muted-foreground/30'
      case 'ready':
        return 'border-blue-400/50 bg-blue-400/5'
      case 'working':
        return 'border-accent/50 bg-accent/5'
      case 'completed':
        return 'border-green-400/50 bg-green-400/5'
      case 'error':
        return 'border-destructive/50 bg-destructive/5'
      case 'skipped':
        return 'border-muted-foreground/20 bg-muted/5'
      default:
        return ''
    }
  }

  const nodeStateArray = Array.from(nodeStates.entries())

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-border/50 z-10 h-full border-l bg-black/70 backdrop-blur-md"
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-border/50 border-b p-4">
              <Badge variant="outline" className="border-accent/50 text-accent font-mono text-xs">
                <Pulse size={12} weight="fill" className="mr-1 animate-pulse" />
                EXECUTION_TRACKER
              </Badge>

              <div className="mt-3 space-y-1 font-mono text-[10px]">
                <div className="text-muted-foreground flex justify-between">
                  <span>STATUS:</span>
                  <span className="text-primary uppercase">
                    {executionContext?.status ?? 'UNKNOWN'}
                  </span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>NODES:</span>
                  <span className="text-primary">{executionContext?.nodeStates?.size ?? 0}</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>RUN_ID:</span>
                  <span className="text-primary truncate">
                    {executionContext?.runId ? executionContext.runId.slice(0, 8) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Node States */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {nodeStateArray.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center font-mono text-xs">
                    <span className="text-primary">{'>'}</span> NO_EXECUTION_DATA
                  </div>
                ) : (
                  nodeStateArray.map(([nodeId, state]) => (
                    <motion.div
                      key={nodeId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-sm border-2 p-3 transition-colors ${getStatusColor(state.status)}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1 truncate font-mono text-xs font-bold">{nodeId}</div>
                        {getStatusIcon(state.status)}
                      </div>

                      <div className="space-y-1">
                        <div className="text-muted-foreground font-mono text-[10px] uppercase">
                          {state.status}
                        </div>

                        {state.error && (
                          <div className="bg-destructive/10 text-destructive rounded-sm p-2 font-mono text-[9px]">
                            {state.error.message}
                          </div>
                        )}

                        {state.output && (
                          <div className="rounded-sm bg-green-400/10 p-2 font-mono text-[9px] text-green-400">
                            OUTPUT: {JSON.stringify(state.output).slice(0, 50)}
                            {JSON.stringify(state.output).length > 50 ? '...' : ''}
                          </div>
                        )}

                        {state.executionVersion > 0 && (
                          <div className="text-muted-foreground font-mono text-[9px]">
                            ITERATION: {state.executionVersion}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* History Summary */}
            <div className="border-border/50 border-t p-3">
              <div className="text-muted-foreground font-mono text-[10px]">
                HISTORY: {executionContext?.history?.length ?? 0} snapshots
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

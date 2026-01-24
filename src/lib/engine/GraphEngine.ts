import type { ExecutionContext, NodeExecutionState, ExecutionSnapshot } from './types'
import type { Token } from './Token'
import { createToken } from './Token'
import { Interpolator } from './Interpolator'
import { nodeRegistry } from './NodeRegistry'
import { Lifecycle } from '../interfaces'

/**
 * Graph Execution Engine
 *
 * The "Heartbeat" of the AETHER_OS system.
 * Implements a Token-Passing execution model with:
 * - Tick-based processing (non-blocking)
 * - Parallel execution
 * - Loop support with safety counters
 * - Barrier synchronization
 * - Dead-end pruning
 * - Provenance tracking
 */

export type GraphDefinition = {
  nodes: Array<{
    id: string
    type: string
    config: Record<string, unknown>
    position?: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
  }>
}

export type ExecutionOptions = {
  maxConcurrent?: number // Max parallel executions (default: 3)
  maxLoopIterations?: number // Safety counter for loops (default: 10)
  tickInterval?: number // Milliseconds between ticks (default: 50)
  autoStart?: boolean // Start execution immediately (default: true)
}

export class GraphEngine implements Lifecycle {
  private context: ExecutionContext
  private graph: GraphDefinition
  private options: Required<ExecutionOptions>
  private tickTimer: ReturnType<typeof setTimeout> | null = null
  private activeTokens = new Map<string, Token>() // Tokens waiting to be consumed
  private listeners = new Set<(context: ExecutionContext) => void>()

  constructor(
    graph: GraphDefinition = { nodes: [], edges: [] },
    options: ExecutionOptions = {}
  ) {
    this.graph = graph
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      maxLoopIterations: options.maxLoopIterations ?? 10,
      tickInterval: options.tickInterval ?? 50,
      autoStart: options.autoStart ?? true,
    }

    // Initialize execution context
    this.context = this.createContext()

    if (this.options.autoStart) {
      this.start()
    }
  }

  // Lifecycle Interface
  initialize(): void {
    this.start()
  }

  dispose(): void {
    this.stop()
    this.listeners.clear()
  }

  /**
   * Update the graph definition (for reactive editors)
   */
  updateGraph(graph: GraphDefinition): void {
    this.graph = graph
    // Potentially sync context nodes if they don't exist
    for (const node of this.graph.nodes) {
      if (!this.context.nodeStates.has(node.id)) {
        this.context.nodeStates.set(node.id, {
          id: node.id,
          status: 'pending',
          inputBuffer: {},
          output: null,
          error: null,
          startTime: 0,
          endTime: 0,
          logs: [],
          retryCount: 0,
          executionVersion: 1,
        })
      }
    }
  }

  /**
   * Create initial execution context
   */
  private createContext(): ExecutionContext {
    const context: ExecutionContext = {
      runId: `run-${Date.now()}`,
      status: 'idle',
      memory: new Map(),
      nodeStates: new Map(),
      edgeSignals: new Map(),
      history: [],
      environment: new Map(),
    }

    // Initialize all nodes as pending
    for (const node of this.graph.nodes) {
      const state: NodeExecutionState = {
        id: node.id,
        status: 'pending',
        inputBuffer: {},
        output: null,
        error: null,
        startTime: 0,
        endTime: 0,
        logs: [],
        retryCount: 0,
        executionVersion: 1,
      }
      context.nodeStates.set(node.id, state)
    }

    return context
  }

  /**
   * Start the execution engine
   */
  start(): void {
    if (this.context.status === 'running') {
      return
    }

    this.context.status = 'running'
    this.scheduleNextTick()
    this.notifyListeners()
  }

  /**
   * Pause execution
   */
  pause(): void {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer)
      this.tickTimer = null
    }
    this.context.status = 'paused'
    this.notifyListeners()
  }

  /**
   * Resume execution
   */
  resume(): void {
    if (this.context.status !== 'paused') {
      return
    }
    this.context.status = 'running'
    this.scheduleNextTick()
    this.notifyListeners()
  }

  /**
   * Stop execution
   */
  stop(): void {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer)
      this.tickTimer = null
    }
    this.context.status = 'completed'
    this.notifyListeners()
  }

  /**
   * Schedule the next tick
   */
  private scheduleNextTick(): void {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer)
    }

    this.tickTimer = setTimeout(() => {
      this.tick()
    }, this.options.tickInterval)
  }

  /**
   * The Tick Cycle
   *
   * 1. Find all ready nodes (inputs available)
   * 2. Execute ready nodes (up to maxConcurrent)
   * 3. Propagate outputs as tokens
   * 4. Check for completion or deadlock
   */
  private async tick(): Promise<void> {
    if (this.context.status !== 'running') {
      return
    }

    // Find nodes that are ready to execute
    const readyNodes = this.findReadyNodes()

    // Execute ready nodes (in parallel, up to maxConcurrent)
    const nodesToExecute = readyNodes.slice(0, this.options.maxConcurrent)

    if (nodesToExecute.length > 0) {
      await Promise.all(nodesToExecute.map((nodeId) => this.executeNode(nodeId)))
    }

    // Check for completion or deadlock
    if (this.isGraphSettled()) {
      this.stop()
      return
    }

    // Schedule next tick
    this.scheduleNextTick()
  }

  /**
   * Find nodes that are ready to execute
   */
  private findReadyNodes(): string[] {
    const ready: string[] = []

    for (const [nodeId, state] of this.context.nodeStates) {
      // Skip if not pending
      if (state.status !== 'pending') continue

      // Check if all required inputs are available
      const incomingEdges = this.getIncomingEdges(nodeId)

      // If no incoming edges, node is a start node (always ready)
      if (incomingEdges.length === 0) {
        ready.push(nodeId)
        continue
      }

      // Check if all incoming edges have tokens
      const hasAllInputs = incomingEdges.every((edge) => {
        return this.activeTokens.has(edge.id) || this.context.edgeSignals.has(edge.id)
      })

      if (hasAllInputs) {
        ready.push(nodeId)
      }
    }

    return ready
  }

  /**
   * Execute a single node
   */
  private async executeNode(nodeId: string): Promise<void> {
    const state = this.context.nodeStates.get(nodeId)
    if (!state) {
      console.error(`Node ${nodeId} not found`)
      return
    }

    const nodeConfig = this.graph.nodes.find((n) => n.id === nodeId)
    if (!nodeConfig) {
      console.error(`Node config for ${nodeId} not found`)
      return
    }

    // Update state to working
    state.status = 'working'
    state.startTime = Date.now()
    this.notifyListeners()

    try {
      // Get node definition from registry
      const definition = nodeRegistry.get(nodeConfig.type)
      if (!definition) {
        throw new Error(`Node type "${nodeConfig.type}" not registered`)
      }

      // Collect inputs from incoming edges (uses cached buffer for retries)
      const inputs = this.collectInputs(nodeId, state)

      // Interpolate inputs
      const interpolated = Interpolator.interpolate(inputs, this.context)

      if (!interpolated.success) {
        throw new Error(
          `Input interpolation failed: ${interpolated.errors.map((e) => e.message).join(', ')}`
        )
      }

      // Validate inputs against schema
      const validated = definition.contract.inputSchema.safeParse(interpolated.value)
      if (!validated.success) {
        throw new Error(`Input validation failed: ${validated.error.message}`)
      }

      // Execute the node
      const processor = nodeRegistry.getProcessor(nodeConfig.type)
      if (!processor) {
        throw new Error(`Processor for "${nodeConfig.type}" not found`)
      }

      const result = await processor.execute(validated.data, nodeConfig.config, this.context)

      // Update state to completed
      state.status = 'completed'
      state.output = result
      state.endTime = Date.now()

      // Clear input buffer and consume tokens/signals on successful completion
      state.inputBuffer = {}
      this.consumeInputs(nodeId)

      // Record history
      this.recordSnapshot(nodeId, 'complete', state)

      // Propagate output as tokens
      this.propagateOutput(nodeId, result)

      this.notifyListeners()
    } catch (error) {
      // Update state to error
      state.status = 'error'
      state.error = error instanceof Error ? error : new Error(String(error))
      state.endTime = Date.now()

      // Check if we should retry
      if (state.retryCount < 3) {
        state.retryCount++
        state.status = 'pending'
        console.warn(`Retrying node ${nodeId} (attempt ${state.retryCount})`)
      } else {
        console.error(`Node ${nodeId} failed after 3 retries:`, error)
        // Clear input buffer and consume tokens/signals on final failure
        state.inputBuffer = {}
        this.consumeInputs(nodeId)
        this.recordSnapshot(nodeId, 'error', state)
      }

      this.notifyListeners()
    }
  }

  /**
   * Collect inputs from incoming edges
   * Uses cached inputBuffer for retries to preserve inputs
   */
  private collectInputs(nodeId: string, state: NodeExecutionState): Record<string, unknown> {
    // If we already have a cached input buffer (from previous retry), use it
    if (state.inputBuffer && Object.keys(state.inputBuffer).length > 0) {
      return state.inputBuffer
    }

    // Collect fresh inputs (but don't delete them yet - only cache)
    const inputs: Record<string, unknown> = {}
    const incomingEdges = this.getIncomingEdges(nodeId)

    for (const edge of incomingEdges) {
      // Check active tokens first
      const token = this.activeTokens.get(edge.id)
      if (token) {
        const handleId = edge.targetHandle || 'default'
        inputs[handleId] = token.data
        continue
      }

      // Check edge signals
      const signal = this.context.edgeSignals.get(edge.id)
      if (signal !== undefined) {
        const handleId = edge.targetHandle || 'default'
        inputs[handleId] = signal
      }
    }

    // Cache the inputs for potential retries
    state.inputBuffer = inputs
    return inputs
  }

  /**
   * Consume inputs by deleting them from activeTokens and edgeSignals
   * Called after successful execution or final failure
   */
  private consumeInputs(nodeId: string): void {
    const incomingEdges = this.getIncomingEdges(nodeId)

    for (const edge of incomingEdges) {
      this.activeTokens.delete(edge.id)
      this.context.edgeSignals.delete(edge.id)
    }
  }

  /**
   * Propagate output as tokens to outgoing edges
   */
  private propagateOutput(nodeId: string, output: unknown): void {
    const outgoingEdges = this.getOutgoingEdges(nodeId)

    for (const edge of outgoingEdges) {
      const token = createToken(nodeId, edge.id, output)
      this.activeTokens.set(edge.id, token)
      this.context.edgeSignals.set(edge.id, output)
    }
  }

  /**
   * Get incoming edges for a node
   */
  private getIncomingEdges(nodeId: string) {
    return this.graph.edges.filter((e) => e.target === nodeId)
  }

  /**
   * Get outgoing edges for a node
   */
  private getOutgoingEdges(nodeId: string) {
    return this.graph.edges.filter((e) => e.source === nodeId)
  }

  /**
   * Check if the graph has settled (completed or deadlocked)
   */
  private isGraphSettled(): boolean {
    const states = Array.from(this.context.nodeStates.values())

    // Check if all nodes are completed or error
    const allFinished = states.every((s) => s.status === 'completed' || s.status === 'error')
    if (allFinished) return true

    // Check for deadlock: nodes are pending but no active tokens
    const hasPending = states.some((s) => s.status === 'pending')
    const hasActiveTokens = this.activeTokens.size > 0
    const hasSignals = this.context.edgeSignals.size > 0

    if (hasPending && !hasActiveTokens && !hasSignals) {
      console.warn('Deadlock detected: nodes pending but no active tokens')
      return true
    }

    return false
  }

  /**
   * Record an execution snapshot (for time-travel debugging)
   */
  private recordSnapshot(
    nodeId: string,
    action: ExecutionSnapshot['action'],
    state: NodeExecutionState
  ): void {
    this.context.history.push({
      timestamp: Date.now(),
      nodeId,
      action,
      state: { ...state },
    })
  }

  /**
   * Subscribe to execution updates
   */
  subscribe(listener: (context: ExecutionContext) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.context)
      } catch (error) {
        console.error('Error in engine listener:', error)
      }
    })
  }

  /**
   * Get current execution context (read-only)
   */
  getContext(): Readonly<ExecutionContext> {
    return this.context
  }

  /**
   * Get execution status
   */
  getStatus(): ExecutionContext['status'] {
    return this.context.status
  }

  /**
   * Set environment variable
   */
  setEnv(key: string, value: unknown): void {
    this.context.environment.set(key, value)
  }

  /**
   * Set global memory variable
   */
  setGlobal(key: string, value: unknown): void {
    this.context.memory.set(key, value)
  }
}

// Export a singleton instance for global usage (matching legacy behavior)
export const graphEngine = new GraphEngine({ autoStart: false })

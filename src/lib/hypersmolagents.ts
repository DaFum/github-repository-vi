import { Lifecycle } from './interfaces'
import {
  CategorizationAgent,
  HealthCheckAgent,
  OptimizationAgent,
  AnalyticsAgent,
  PredictionAgent,
  AuditAgent,
  RefinementAgent,
  SpecializedAgent,
} from './agents'

/**
 * Represents a task to be executed by an agent.
 */
type AgentTask = {
  id: string
  type: 'categorize' | 'health-check' | 'optimize' | 'analyze' | 'predict' | 'audit' | 'refine'
  payload: unknown
  priority: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
  result?: unknown
  error?: string
}

/**
 * Metrics tracking the performance of the agent system.
 */
type AgentMetrics = {
  tasksCompleted: number
  tasksFailed: number
  averageTaskTime: number
  successRate: number
  lastOptimization: number
}

/**
 * HyperSmolAgents
 *
 * The biological heart of the HyperSmol ecosystem. This kernel orchestrates
 * asynchronous micro-intelligences to perform tasks without blocking the
 * main thread, mimicking a living organism's autonomic nervous system.
 */
type AgentEventListener = (task: AgentTask) => void

class HyperSmolAgents implements Lifecycle {
  private taskQueue: AgentTask[] = []
  private runningTasks: Map<string, AgentTask> = new Map()
  private listeners: AgentEventListener[] = []
  private metrics: AgentMetrics = {
    tasksCompleted: 0,
    tasksFailed: 0,
    averageTaskTime: 0,
    successRate: 100,
    lastOptimization: Date.now(),
  }
  private maxConcurrent = 3
  private isDisposed = false

  // Agent instances
  private agents = {
    categorize: new CategorizationAgent(),
    'health-check': new HealthCheckAgent(),
    optimize: new OptimizationAgent(),
    analyze: new AnalyticsAgent(),
    predict: new PredictionAgent(),
    audit: new AuditAgent(),
    refine: new RefinementAgent(),
  }

  /**
   * Initializes the agent system.
   */
  async initialize(): Promise<void> {
    this.isDisposed = false
    console.log('HyperSmolAgents initialized')
  }

  /**
   * Disposes of the agent system, clearing queues and stopping tasks.
   */
  async dispose(): Promise<void> {
    this.isDisposed = true
    this.taskQueue = []
    this.runningTasks.clear()
    this.listeners = []
    console.log('HyperSmolAgents disposed')
  }

  /**
   * Subscribes to task updates.
   * @param listener The callback function to be called on task updates.
   * @returns A function to unsubscribe.
   */
  subscribe(listener: AgentEventListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(task: AgentTask) {
    this.listeners.forEach((listener) => {
      try {
        listener(task)
      } catch (e) {
        console.error('Error in agent listener:', e)
      }
    })
  }

  /**
   * Enqueues a task for execution.
   * @param type The type of task to perform.
   * @param payload The data required for the task.
   * @param priority The priority of the task (higher is more important).
   * @returns The ID of the created task.
   */
  async enqueueTask(type: AgentTask['type'], payload: unknown, priority = 5): Promise<string> {
    if (this.isDisposed) {
      throw new Error('Agent system is disposed')
    }

    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      priority,
      status: 'pending',
      createdAt: Date.now(),
    }

    this.taskQueue.push(task)
    this.taskQueue.sort((a, b) => b.priority - a.priority)

    this.processQueue()

    return task.id
  }

  /**
   * Processes the task queue, starting tasks up to the concurrency limit.
   */
  private processQueue(): void {
    if (this.isDisposed) return

    while (this.runningTasks.size < this.maxConcurrent && this.taskQueue.length > 0) {
      if (this.isDisposed) break
      const task = this.taskQueue.shift()!
      task.status = 'running'
      this.runningTasks.set(task.id, task)
      this.executeTask(task)
    }
  }

  /**
   * Executes a single task using the appropriate agent.
   * @param task The task to execute.
   */
  private async executeTask(task: AgentTask): Promise<void> {
    const startTime = Date.now()

    try {
      // Explicitly typecast to allow dynamic access while maintaining type safety
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const agent = this.agents[task.type] as SpecializedAgent<any, any>
      if (!agent) {
        throw new Error(`Unknown task type: ${task.type}`)
      }

      const result = await agent.execute(task.payload)

      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      this.metrics.tasksCompleted++

      // Self-optimize every 10 tasks to prevent oscillation
      if (this.metrics.tasksCompleted % 10 === 0) {
        await this.selfOptimize()
      }

      this.notifyListeners(task)
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = Date.now()
      this.metrics.tasksFailed++
      console.error(`Task ${task.id} failed:`, error)

      this.notifyListeners(task)
    } finally {
      const duration = Date.now() - startTime
      this.updateMetrics(duration)
      this.runningTasks.delete(task.id)

      // Trigger next task processing
      this.processQueue()
    }
  }

  /**
   * Updates internal metrics after task completion.
   * @param taskDuration The time taken to complete the task.
   */
  private updateMetrics(taskDuration: number): void {
    const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFailed
    this.metrics.averageTaskTime =
      (this.metrics.averageTaskTime * (totalTasks - 1) + taskDuration) / totalTasks
    this.metrics.successRate = (this.metrics.tasksCompleted / totalTasks) * 100
  }

  /**
   * Retrieves the current system metrics.
   * @returns A copy of the current metrics.
   */
  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  /**
   * Retrieves the current status of the task queue.
   * @returns An object containing the count of pending and running tasks.
   */
  getQueueStatus(): { pending: number; running: number } {
    return {
      pending: this.taskQueue.length,
      running: this.runningTasks.size,
    }
  }

  /**
   * Adjusts system parameters (like concurrency) based on performance metrics.
   */
  async selfOptimize(): Promise<void> {
    const metrics = this.getMetrics()
    let changed = false

    if (metrics.averageTaskTime > 3000 && this.maxConcurrent > 1) {
      this.maxConcurrent = Math.max(1, this.maxConcurrent - 1)
      changed = true
    } else if (metrics.averageTaskTime < 1000 && this.maxConcurrent < 5) {
      this.maxConcurrent = Math.min(5, this.maxConcurrent + 1)
      changed = true
    }

    this.metrics.lastOptimization = Date.now()

    if (changed) {
      this.processQueue()
    }
  }
}

/**
 * Global instance of HyperSmolAgents.
 */
export const hyperSmolAgents = new HyperSmolAgents()

// Factory function pattern
/**
 * Factory function to create a new HyperSmolAgents instance.
 */
export const createHyperSmolAgents = () => new HyperSmolAgents()

export type { AgentTask, AgentMetrics }

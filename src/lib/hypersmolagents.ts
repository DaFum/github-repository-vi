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

type AgentMetrics = {
  tasksCompleted: number
  tasksFaileds: number
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
class HyperSmolAgents implements Lifecycle {
  private taskQueue: AgentTask[] = []
  private runningTasks: Map<string, AgentTask> = new Map()
  private metrics: AgentMetrics = {
    tasksCompleted: 0,
    tasksFaileds: 0,
    averageTaskTime: 0,
    successRate: 100,
    lastOptimization: Date.now(),
  }
  private maxConcurrent = 3
  private isProcessing = false
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

  async initialize(): Promise<void> {
    this.isDisposed = false
    console.log('HyperSmolAgents initialized')
  }

  async dispose(): Promise<void> {
    this.isDisposed = true
    this.taskQueue = []
    this.runningTasks.clear()
    this.isProcessing = false
    console.log('HyperSmolAgents disposed')
  }

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

    if (!this.isProcessing) {
      this.processQueue()
    }

    return task.id
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.isDisposed) return
    this.isProcessing = true

    while ((this.taskQueue.length > 0 || this.runningTasks.size > 0) && !this.isDisposed) {
      while (this.runningTasks.size < this.maxConcurrent && this.taskQueue.length > 0) {
        if (this.isDisposed) break
        const task = this.taskQueue.shift()!
        task.status = 'running'
        this.runningTasks.set(task.id, task)
        this.executeTask(task)
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.isProcessing = false
  }

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
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = Date.now()
      this.metrics.tasksFaileds++
      console.error(`Task ${task.id} failed:`, error)
    } finally {
      const duration = Date.now() - startTime
      this.updateMetrics(duration)
      this.runningTasks.delete(task.id)
    }
  }

  private updateMetrics(taskDuration: number): void {
    const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFaileds
    this.metrics.averageTaskTime =
      (this.metrics.averageTaskTime * (totalTasks - 1) + taskDuration) / totalTasks
    this.metrics.successRate = (this.metrics.tasksCompleted / totalTasks) * 100
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  getQueueStatus(): { pending: number; running: number } {
    return {
      pending: this.taskQueue.length,
      running: this.runningTasks.size,
    }
  }

  async selfOptimize(): Promise<void> {
    const metrics = this.getMetrics()

    if (metrics.averageTaskTime > 3000 && this.maxConcurrent > 1) {
      this.maxConcurrent = Math.max(1, this.maxConcurrent - 1)
    } else if (metrics.averageTaskTime < 1000 && this.maxConcurrent < 5) {
      this.maxConcurrent = Math.min(5, this.maxConcurrent + 1)
    }

    this.metrics.lastOptimization = Date.now()
  }
}

export const hyperSmolAgents = new HyperSmolAgents()

// Factory function pattern
export const createHyperSmolAgents = () => new HyperSmolAgents()

export type { AgentTask, AgentMetrics }

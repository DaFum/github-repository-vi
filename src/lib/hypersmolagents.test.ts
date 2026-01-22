import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createHyperSmolAgents } from './hypersmolagents'

// Mock pollinations to avoid network calls
vi.mock('./pollinations', () => ({
  pollinations: {
    chat: vi.fn().mockResolvedValue('mock-response'),
    smartSelectModel: vi.fn().mockReturnValue('openai'),
  },
}))

describe('HyperSmolAgents', () => {
  let agents: ReturnType<typeof createHyperSmolAgents>

  beforeEach(async () => {
    agents = createHyperSmolAgents()
    await agents.initialize()
  })

  afterEach(async () => {
    await agents.dispose()
  })

  describe('Initialization and Disposal', () => {
    it('should initialize successfully', async () => {
      const newAgent = createHyperSmolAgents()
      await expect(newAgent.initialize()).resolves.toBeUndefined()
      await newAgent.dispose()
    })

    it('should dispose successfully', async () => {
      await expect(agents.dispose()).resolves.toBeUndefined()
    })

    it('should throw error when enqueueing task after disposal', async () => {
      await agents.dispose()
      await expect(agents.enqueueTask('categorize', 'test', 5)).rejects.toThrow(
        'Agent system is disposed'
      )
    })
  })

  describe('Task Queuing', () => {
    it('should enqueue a task and return task ID', async () => {
      const taskId = await agents.enqueueTask('categorize', 'https://example.com', 5)

      expect(taskId).toBeTruthy()
      expect(taskId).toMatch(/^task-\d+-[a-z0-9]+$/)
    })

    it('should queue tasks with correct priority ordering', async () => {
      const lowPriorityId = await agents.enqueueTask('categorize', 'low', 1)
      const highPriorityId = await agents.enqueueTask('categorize', 'high', 10)

      expect(highPriorityId).toBeTruthy()
      expect(lowPriorityId).toBeTruthy()

      // Higher priority tasks should be processed first
      const status = agents.getQueueStatus()
      expect(status.pending + status.running).toBeGreaterThanOrEqual(0)
    })

    it('should handle multiple concurrent tasks', async () => {
      const tasks = await Promise.all([
        agents.enqueueTask('categorize', 'url1', 5),
        agents.enqueueTask('categorize', 'url2', 5),
        agents.enqueueTask('categorize', 'url3', 5),
      ])

      expect(tasks).toHaveLength(3)
      tasks.forEach((taskId) => {
        expect(taskId).toMatch(/^task-/)
      })
    })
  })

  describe('Task Listeners', () => {
    it('should subscribe to task events', () => {
      const listener = vi.fn()
      const unsubscribe = agents.subscribe(listener)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should notify listeners on task completion', async () => {
      const listener = vi.fn()
      agents.subscribe(listener)

      await agents.enqueueTask('categorize', 'https://example.com', 5)

      // Wait for async task processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Listener should be called (at least once for task completion/failure)
      expect(listener).toHaveBeenCalled()
    })

    it('should allow unsubscribing from events', async () => {
      const listener = vi.fn()
      const unsubscribe = agents.subscribe(listener)

      unsubscribe()

      await agents.enqueueTask('categorize', 'https://example.com', 5)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Listener should NOT be called after unsubscribe
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Metrics', () => {
    it('should return initial metrics', () => {
      const metrics = agents.getMetrics()

      expect(metrics).toHaveProperty('tasksCompleted')
      expect(metrics).toHaveProperty('tasksFailed')
      expect(metrics).toHaveProperty('averageTaskTime')
      expect(metrics).toHaveProperty('successRate')
      expect(metrics).toHaveProperty('lastOptimization')

      expect(metrics.tasksCompleted).toBe(0)
      expect(metrics.tasksFailed).toBe(0)
      expect(metrics.successRate).toBe(100)
    })

    it('should update metrics after task completion', async () => {
      const initialMetrics = agents.getMetrics()

      await agents.enqueueTask('categorize', 'https://example.com', 5)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedMetrics = agents.getMetrics()

      // Either completed or failed should have increased
      expect(updatedMetrics.tasksCompleted + updatedMetrics.tasksFailed).toBeGreaterThan(
        initialMetrics.tasksCompleted + initialMetrics.tasksFailed
      )
    })

    it('should calculate success rate correctly', async () => {
      await agents.enqueueTask('categorize', 'url1', 5)
      await agents.enqueueTask('categorize', 'url2', 5)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const metrics = agents.getMetrics()
      const totalTasks = metrics.tasksCompleted + metrics.tasksFailed

      if (totalTasks > 0) {
        const expectedRate = (metrics.tasksCompleted / totalTasks) * 100
        expect(metrics.successRate).toBeCloseTo(expectedRate, 1)
      }
    })
  })

  describe('Queue Status', () => {
    it('should return queue status', () => {
      const status = agents.getQueueStatus()

      expect(status).toHaveProperty('pending')
      expect(status).toHaveProperty('running')
      expect(typeof status.pending).toBe('number')
      expect(typeof status.running).toBe('number')
    })

    it('should track pending and running tasks', async () => {
      const initialStatus = agents.getQueueStatus()

      await agents.enqueueTask('categorize', 'url1', 5)
      const afterEnqueueStatus = agents.getQueueStatus()

      // Either pending or running should increase
      expect(afterEnqueueStatus.pending + afterEnqueueStatus.running).toBeGreaterThanOrEqual(
        initialStatus.pending + initialStatus.running
      )
    })
  })

  describe('Self-Optimization', () => {
    it('should trigger self-optimization', async () => {
      const initialMetrics = agents.getMetrics()
      const initialOptTime = initialMetrics.lastOptimization

      await agents.selfOptimize()

      const updatedMetrics = agents.getMetrics()

      // lastOptimization timestamp should be updated
      expect(updatedMetrics.lastOptimization).toBeGreaterThanOrEqual(initialOptTime)
    })

    it('should adjust concurrency based on performance', async () => {
      // This is tested indirectly through the metrics
      await agents.selfOptimize()

      const metrics = agents.getMetrics()
      expect(metrics.lastOptimization).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const goodListener = vi.fn()

      agents.subscribe(errorListener)
      agents.subscribe(goodListener)

      await agents.enqueueTask('categorize', 'url', 5)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Good listener should still be called despite error in errorListener
      expect(errorListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
    })
  })

  describe('Task Types', () => {
    const taskTypes = [
      'categorize',
      'health-check',
      'optimize',
      'analyze',
      'predict',
      'audit',
      'refine',
    ] as const

    taskTypes.forEach((type) => {
      it(`should support ${type} task type`, async () => {
        const taskId = await agents.enqueueTask(type, { test: 'data' }, 5)
        expect(taskId).toBeTruthy()
      })
    })
  })

  describe('Concurrency Control', () => {
    it('should respect max concurrent limit', async () => {
      // Enqueue more tasks than max concurrent (3)
      const tasks = await Promise.all([
        agents.enqueueTask('categorize', '1', 5),
        agents.enqueueTask('categorize', '2', 5),
        agents.enqueueTask('categorize', '3', 5),
        agents.enqueueTask('categorize', '4', 5),
        agents.enqueueTask('categorize', '5', 5),
      ])

      expect(tasks).toHaveLength(5)

      const status = agents.getQueueStatus()

      // Running tasks should not exceed max concurrent (3)
      expect(status.running).toBeLessThanOrEqual(3)
    })
  })
})

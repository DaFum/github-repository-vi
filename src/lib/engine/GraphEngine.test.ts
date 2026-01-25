import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GraphEngine } from './GraphEngine'
import { nodeRegistry } from './NodeRegistry'
import { z } from 'zod'

// Mock NodeRegistry
vi.mock('./NodeRegistry', () => ({
  nodeRegistry: {
    get: vi.fn(),
    getProcessor: vi.fn(),
  },
  NodeRegistry: {
    getInstance: vi.fn(),
  }
}))

describe('GraphEngine', () => {
  let engine: GraphEngine

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (engine) {
      engine.dispose()
    }
  })

  describe('Lifecycle', () => {
    it('should initialize with default options', () => {
      engine = new GraphEngine()
      expect(engine.getStatus()).toBe('running')
    })

    it('should start automatically if autoStart is true', () => {
       engine = new GraphEngine({ nodes: [], edges: [] }, { autoStart: true })
       expect(engine.getStatus()).toBe('running')
    })

    it('should not start automatically if autoStart is false', () => {
      engine = new GraphEngine({ nodes: [], edges: [] }, { autoStart: false })
      expect(engine.getStatus()).toBe('idle')
   })

    it('should start when requested', () => {
      engine = new GraphEngine({ nodes: [], edges: [] }, { autoStart: false })
      engine.start()
      expect(engine.getStatus()).toBe('running')
    })

    it('should stop when requested', () => {
      engine = new GraphEngine({ nodes: [], edges: [] }, { autoStart: true })
      engine.stop()
      expect(engine.getStatus()).toBe('completed')
    })

    it('should pause and resume', () => {
        engine = new GraphEngine({ nodes: [], edges: [] }, { autoStart: true })
        engine.pause()
        expect(engine.getStatus()).toBe('paused')
        engine.resume()
        expect(engine.getStatus()).toBe('running')
    })
  })

  describe('Execution', () => {
    it('should execute a simple node', async () => {
      // Setup graph
      const graph = {
        nodes: [
          {
            id: 'node1',
            type: 'testNode',
            config: { value: 123 },
            position: { x: 0, y: 0 }
          }
        ],
        edges: []
      }

      // Setup mock registry
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('success')
      }

      const mockDefinition = {
        contract: {
          type: 'testNode',
          inputSchema: z.any(),
          outputSchema: z.any()
        },
        processor: mockProcessor
      }

      vi.mocked(nodeRegistry.get).mockReturnValue(mockDefinition as any)
      vi.mocked(nodeRegistry.getProcessor).mockReturnValue(mockProcessor as any)

      // Initialize engine
      engine = new GraphEngine(graph, { autoStart: false, tickInterval: 10 })

      // Spy on listener
      const listener = vi.fn()
      engine.subscribe(listener)

      // Start
      engine.start()

      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check results
      const context = engine.getContext()
      const nodeState = context.nodeStates.get('node1')

      expect(nodeState).toBeDefined()
      expect(nodeState?.status).toBe('completed')
      expect(nodeState?.output).toBe('success')
      expect(mockProcessor.execute).toHaveBeenCalled()
    })

    it('should handle execution errors', async () => {
        // Setup graph
        const graph = {
          nodes: [
            {
              id: 'nodeError',
              type: 'errorNode',
              config: {},
              position: { x: 0, y: 0 }
            }
          ],
          edges: []
        }

        // Setup mock registry
        const mockProcessor = {
          execute: vi.fn().mockRejectedValue(new Error('Test Error'))
        }

        const mockDefinition = {
          contract: {
            type: 'errorNode',
            inputSchema: z.any(),
            outputSchema: z.any()
          },
          processor: mockProcessor
        }

        vi.mocked(nodeRegistry.get).mockReturnValue(mockDefinition as any)
        vi.mocked(nodeRegistry.getProcessor).mockReturnValue(mockProcessor as any)

        // Initialize engine
        engine = new GraphEngine(graph, { autoStart: false, tickInterval: 10 })
        engine.start()

        // Wait for execution
        await new Promise(resolve => setTimeout(resolve, 100))

        // Check results
        const context = engine.getContext()
        const nodeState = context.nodeStates.get('nodeError')

        // Node should be in retry loop (pending) or error if exhausted
        if (nodeState?.status === 'pending') {
            expect(nodeState.retryCount).toBeGreaterThan(0)
        } else {
            expect(nodeState?.status).toBe('error')
            expect(nodeState?.error).toBeDefined()
        }
      })
  })
})

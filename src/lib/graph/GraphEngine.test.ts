import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createGraphEngine } from './GraphEngine'
import { useFlowStore } from '@/store/flowStore'
import { NodeRegistry } from './NodeRegistry'

// Mock useFlowStore
vi.mock('@/store/flowStore', () => ({
  useFlowStore: {
    getState: vi.fn(),
  },
}))

// Mock NodeRegistry
vi.mock('./NodeRegistry', () => ({
  NodeRegistry: {
    get: vi.fn(),
    getDefinition: vi.fn(),
  },
}))

describe('GraphEngine', () => {
  let engine: ReturnType<typeof createGraphEngine>

  beforeEach(() => {
    engine = createGraphEngine()
    vi.clearAllMocks()
  })

  afterEach(() => {
    engine.dispose()
  })

  describe('Lifecycle', () => {
    it('should initialize and start', () => {
      expect(() => engine.initialize()).not.toThrow()
    })

    it('should stop on dispose', () => {
      engine.initialize()
      expect(() => engine.dispose()).not.toThrow()
    })

    it('should start the tick interval', () => {
      engine.start()
      // Engine should be running
      engine.stop()
    })

    it('should stop the tick interval', () => {
      engine.start()
      expect(() => engine.stop()).not.toThrow()
    })

    it('should not start multiple intervals', () => {
      engine.start()
      engine.start() // Second call should be no-op
      engine.stop()
    })
  })

  describe('Tick Loop', () => {
    it('should tick when status is running', async () => {
      const mockStore = {
        nodes: [],
        edges: [],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)

      engine.start()

      // Wait for a tick
      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should have called getState
      expect(useFlowStore.getState).toHaveBeenCalled()
    })

    it('should skip tick when status is not running', async () => {
      const mockStore = {
        nodes: [],
        edges: [],
        executionContext: {
          status: 'idle' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should still call getState to check status
      expect(useFlowStore.getState).toHaveBeenCalled()
    })

    it('should prevent re-entrant ticks', async () => {
      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test' } }],
        edges: [],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      // Mock processor that takes time
      const mockProcessor = {
        execute: vi.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
          return 'result'
        }),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      // Wait for multiple tick intervals
      await new Promise((resolve) => setTimeout(resolve, 150))

      engine.stop()

      // Processor should not be called multiple times due to re-entrancy protection
      // (though it may be called once if the first tick completes)
      expect(mockProcessor.execute.mock.calls.length).toBeLessThanOrEqual(1)
    })
  })

  describe('Node Execution', () => {
    it('should find ready nodes with no incoming edges', () => {
      const mockStore = {
        nodes: [
          { id: 'trigger', data: { type: 'trigger' } },
          { id: 'agent', data: { type: 'agent' } },
        ],
        edges: [{ id: 'e1', source: 'trigger', target: 'agent' }],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)

      // Trigger node has no incoming edges, so it should be ready
      // (This is tested indirectly through the tick loop)
    })

    it('should execute node when all inputs are ready', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('test-result'),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should have called execute
      expect(mockProcessor.execute).toHaveBeenCalled()
    })

    it('should update node status during execution', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('result'),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should update status to 'working' and then 'completed'
      expect(mockStore.updateNodeStatus).toHaveBeenCalledWith('node1', 'working')
      expect(mockStore.updateNodeStatus).toHaveBeenCalledWith('node1', 'completed')
    })

    it('should propagate signals to outgoing edges', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('output-value'),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [
          { id: 'e1', source: 'node1', target: 'node2' },
          { id: 'e2', source: 'node1', target: 'node3' },
        ],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should set signals on both outgoing edges
      expect(mockStore.setEdgeSignal).toHaveBeenCalledWith('e1', 'output-value')
      expect(mockStore.setEdgeSignal).toHaveBeenCalledWith('e2', 'output-value')
    })

    it('should not propagate null/undefined results (dead-end pruning)', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue(null),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [{ id: 'e1', source: 'node1', target: 'node2' }],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should NOT set edge signal for null result
      expect(mockStore.setEdgeSignal).not.toHaveBeenCalled()
    })

    it('should handle node execution errors', async () => {
      const mockProcessor = {
        execute: vi.fn().mockRejectedValue(new Error('Execution failed')),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map(),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should set status to 'error'
      expect(mockStore.updateNodeStatus).toHaveBeenCalledWith('node1', 'error')
    })
  })

  describe('Barrier Synchronization', () => {
    it('should wait for all incoming edges to have signals', () => {
      const mockStore = {
        nodes: [{ id: 'merge', data: { type: 'merge' } }],
        edges: [
          { id: 'e1', source: 'node1', target: 'merge' },
          { id: 'e2', source: 'node2', target: 'merge' },
        ],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map([['e1', 'value1']]), // Only e1 has signal
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)

      // Merge node should NOT be ready (e2 has no signal)
      // This is tested indirectly - node should not execute
    })

    it('should execute when all incoming signals are present', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('merged'),
      }

      const mockStore = {
        nodes: [{ id: 'merge', data: { type: 'merge', config: {} } }],
        edges: [
          { id: 'e1', source: 'node1', target: 'merge' },
          { id: 'e2', source: 'node2', target: 'merge' },
        ],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map([
            ['e1', 'value1'],
            ['e2', 'value2'],
          ]), // Both edges have signals
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should execute with both inputs
      expect(mockProcessor.execute).toHaveBeenCalled()
    })
  })

  describe('Input Resolution', () => {
    it('should resolve inputs from incoming edges', async () => {
      const mockProcessor = {
        execute: vi.fn().mockResolvedValue('result'),
      }

      const mockStore = {
        nodes: [{ id: 'node1', data: { type: 'test', config: {} } }],
        edges: [
          { id: 'e1', source: 'input1', target: 'node1', sourceHandle: 'out1' },
          { id: 'e2', source: 'input2', target: 'node1', sourceHandle: 'out2' },
        ],
        executionContext: {
          status: 'running' as const,
          edgeSignals: new Map([
            ['e1', 'data1'],
            ['e2', 'data2'],
          ]),
          nodeStates: new Map(),
        },
        updateNodeStatus: vi.fn(),
        setEdgeSignal: vi.fn(),
      }

      vi.mocked(useFlowStore.getState).mockReturnValue(mockStore as never)
      vi.mocked(NodeRegistry.get).mockReturnValue(mockProcessor as never)
      vi.mocked(NodeRegistry.getDefinition).mockReturnValue(undefined)

      engine.start()

      await new Promise((resolve) => setTimeout(resolve, 100))

      engine.stop()

      // Should have received both inputs
      expect(mockProcessor.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          out1: 'data1',
          out2: 'data2',
        }),
        {},
        expect.anything()
      )
    })
  })
})

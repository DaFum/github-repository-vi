import { create } from 'zustand'
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { ExecutionContext, NodeExecutionState } from '@/lib/graph/types'

export type AgentNodeData = {
  label: string
  type: 'agent' | 'tool' | 'trigger'
  config?: Record<string, unknown>
}

export type AppNode = Node<AgentNodeData>

type FlowState = {
  nodes: AppNode[]
  edges: Edge[]
  executionContext: ExecutionContext

  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (node: AppNode) => void

  // Execution Actions
  startExecution: () => void
  pauseExecution: () => void
  stopExecution: () => void
  updateNodeStatus: (nodeId: string, status: NodeExecutionState['status']) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEdgeSignal: (edgeId: string, data: any) => void
}

// Initial state for testing
const initialNodes: AppNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { label: 'Start (Webhook)', type: 'trigger' },
  },
  {
    id: 'agent-1',
    type: 'agent',
    position: { x: 400, y: 100 },
    data: { label: 'Summarizer Agent', type: 'agent' },
  },
]

const initialEdges: Edge[] = []

const initialExecutionContext: ExecutionContext = {
  runId: 'init',
  status: 'idle',
  memory: new Map(),
  nodeStates: new Map(),
  edgeSignals: new Map(),
  history: [],
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  executionContext: initialExecutionContext,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },
  addNode: (node: AppNode) => {
    set({
      nodes: [...get().nodes, node],
    })
  },

  // --- Execution Actions ---
  startExecution: () => {
    set((state) => ({
      executionContext: {
        ...state.executionContext,
        status: 'running',
        runId: Date.now().toString(),
      },
    }))
  },
  pauseExecution: () => {
    set((state) => ({
      executionContext: { ...state.executionContext, status: 'paused' },
    }))
  },
  stopExecution: () => {
    set((state) => ({
      executionContext: { ...state.executionContext, status: 'idle', edgeSignals: new Map() },
    }))
  },
  updateNodeStatus: (nodeId, status) => {
    set((state) => {
      const newStates = new Map(state.executionContext.nodeStates)
      const currentState = newStates.get(nodeId) || {
        id: nodeId,
        status: 'pending',
        inputBuffer: {},
        output: null,
        error: null,
        logs: [],
        retryCount: 0,
      }
      newStates.set(nodeId, { ...currentState, status })
      return {
        executionContext: { ...state.executionContext, nodeStates: newStates },
      }
    })
  },
  setEdgeSignal: (edgeId, data) => {
    set((state) => {
      const newSignals = new Map(state.executionContext.edgeSignals)
      newSignals.set(edgeId, data)
      return {
        executionContext: { ...state.executionContext, edgeSignals: newSignals },
      }
    })
  },
}))

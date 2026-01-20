import { useFlowStore } from '@/store/flowStore';
import { NodeRegistry } from './NodeRegistry';
import { ExecutionContext } from './types';
import { Interpolator } from './Interpolator';
import { HistoryRecorder } from './HistoryRecorder';

export class GraphEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private isTicking = false;

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 50);
    console.log('Graph Engine Started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Graph Engine Stopped');
  }

  private async tick() {
    if (this.isTicking) return;
    this.isTicking = true;

    try {
      const store = useFlowStore.getState();
      const context = store.executionContext;

      if (context.status !== 'running') {
        this.isTicking = false;
        return;
      }

      const readyNodes = this.findReadyNodes(store);

      if (readyNodes.length > 0) {
        await Promise.all(readyNodes.map(node => this.executeNode(node, store)));
      } else {
        // Check for completion or deadlock
      }

    } catch (error) {
      console.error('Engine Tick Error:', error);
    } finally {
      this.isTicking = false;
    }
  }

  private findReadyNodes(store: any) {
    const { nodes, edges, executionContext } = store;
    const { edgeSignals, nodeStates } = executionContext;

    return nodes.filter((node: any) => {
        const state = nodeStates.get(node.id);
        if (state && state.status !== 'pending') return false;

        // Barrier Synchronization: Check if ALL incoming edges have signals
        const incomingEdges = edges.filter((edge: any) => edge.target === node.id);
        const allInputsReady = incomingEdges.every((edge: any) => edgeSignals.has(edge.id));

        return allInputsReady;
    });
  }

  private resolveInputs(node: any, store: any): Record<string, any> {
      const { edges, executionContext } = store;
      const inputs: Record<string, any> = {};

      const incomingEdges = edges.filter((edge: any) => edge.target === node.id);

      incomingEdges.forEach((edge: any) => {
          const signal = executionContext.edgeSignals.get(edge.id);
          // Simplified: use source handle as key or just 'input'
          inputs[edge.sourceHandle || 'input'] = signal;
      });

      return inputs;
  }

  private async executeNode(node: any, store: any) {
    const nodeId = node.id;
    store.updateNodeStatus(nodeId, 'working');

    try {
      const processor = NodeRegistry.get(node.data.type);
      const definition = NodeRegistry.getDefinition(node.data.type);

      // 1. Resolve Raw Inputs from Edges
      let inputs = this.resolveInputs(node, store);

      // 2. Interpolate (Hydration)
      inputs = Interpolator.hydrate(inputs, inputs); // Self-reference for simple interpolation, normally Global Memory

      // 3. JIT Schema Validation
      if (definition?.inputs) {
          const validation = Interpolator.validateAndCoerce(inputs, definition.inputs);
          if (!validation.success) {
              throw new Error(`Input Validation Failed: ${validation.error}`);
          }
          inputs = validation.data;
      }

      // 4. Execution
      const result = await processor.execute(inputs, node.data.config || {}, store.executionContext);

      // 5. Output Provenance
      const provenance = HistoryRecorder.generateProvenance(nodeId, inputs);

      console.log(`Node ${nodeId} Completed:`, result);

      store.updateNodeStatus(nodeId, 'completed');

      // 6. Propagate Signals (Cognitive Routing)
      // Dead-End Pruning: If result is null/undefined, do not emit signal?
      // Or emit explicit "Null Token".
      if (result !== null && result !== undefined) {
          const outgoingEdges = store.edges.filter((edge: any) => edge.source === node.id);
          outgoingEdges.forEach((edge: any) => {
              store.setEdgeSignal(edge.id, result);
          });
      }

      // 7. Record History
      HistoryRecorder.recordDelta(store.executionContext);

    } catch (error) {
      console.error(`Node ${nodeId} Failed:`, error);
      store.updateNodeStatus(nodeId, 'error');
    }
  }
}

export const graphEngine = new GraphEngine();

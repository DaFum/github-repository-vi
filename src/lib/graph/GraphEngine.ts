import { useFlowStore } from '@/store/flowStore';
import { NodeRegistry } from './NodeRegistry';
import { ExecutionContext } from './types';

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
        // console.log('Idle tick...');
      }

    } catch (error) {
      console.error('Engine Tick Error:', error);
    } finally {
      this.isTicking = false;
    }
  }

  private findReadyNodes(store: any) {
    // 1. Scan topology
    // 2. Check signals
    // 3. Return nodes with status 'pending' that have all inputs satisfied

    // Simplification for v1: Just pick pending nodes that have no inputs (Roots)
    // or mock dependency check
    return store.nodes.filter((node: any) => {
        const state = store.executionContext.nodeStates.get(node.id);
        return !state || state.status === 'pending';
    });
  }

  private async executeNode(node: any, store: any) {
    const nodeId = node.id;
    store.updateNodeStatus(nodeId, 'working');

    try {
      const processor = NodeRegistry.get(node.data.type);

      // Interpolate inputs (Mock)
      const inputs = {};

      const result = await processor.execute(inputs, node.data.config || {}, store.executionContext);

      console.log(`Node ${nodeId} Completed:`, result);

      store.updateNodeStatus(nodeId, 'completed');

      // Propagate signals (Mock)
      // find outgoing edges -> setEdgeSignal

    } catch (error) {
      console.error(`Node ${nodeId} Failed:`, error);
      store.updateNodeStatus(nodeId, 'error');
    }
  }
}

export const graphEngine = new GraphEngine();

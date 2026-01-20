import { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flowStore';
import { nodeTypes, TriggerNode, AgentNode, ToolNode } from './CustomNodes';
import { Sidebar } from './Sidebar';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

// Helper component to handle dropping
const DropZone = () => {
  const { screenToFlowPosition, addNodes } = useReactFlow();
  const addNode = useFlowStore((state) => state.addNode);

  // We need to expose a method or context for the parent DndContext to use,
  // but since DndContext wraps everything, we handle onDragEnd at the parent level
  // and need access to the flow instance.
  // Actually, standard DndKit usage is easier if we just use the event data.
  // However, converting screen coordinates to flow coordinates requires the instance.
  // So we lift the handleDragEnd logic to a component inside ReactFlowProvider.

  return null;
}

const FlowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useFlowStore();
  const { screenToFlowPosition } = useReactFlow();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if dropped over the canvas (we can simulate this by checking if it's not over sidebar)
    // For simplicity in this v1, we just spawn it at a default location if no position logic
    // But better: use the mouse position from the event if possible.
    // DndKit doesn't give drop coordinates relative to container easily without droppable zones.

    // Fallback: Add to center or random position
    if (active.data.current) {
        const type = active.data.current.type;
        const label = active.data.current.label;

        // Random pos for now as DndKit + ReactFlow coord mapping is tricky without a ref to the canvas container
        const position = {
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100
        };

        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: { label, type },
        };

        addNode(newNode);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="flex h-full w-full">
            <Sidebar />
            <div className="flex-1 h-full relative bg-black/90">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode="dark"
                >
                    <Background color="#333" gap={20} />
                    <Controls />
                    <MiniMap className="!bg-background/50 !border-border" />
                </ReactFlow>
            </div>
        </div>
    </DndContext>
  );
};

export const FlowEditor = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
};

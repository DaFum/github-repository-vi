import { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flowStore';
import { nodeTypes, TriggerNode, AgentNode, ToolNode } from './CustomNodes';
import { Sidebar } from './Sidebar';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Play, Stop } from '@phosphor-icons/react';
import { graphEngine } from '@/lib/graph/GraphEngine';

const FlowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, startExecution, stopExecution, executionContext } = useFlowStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    if (active.data.current) {
        const type = active.data.current.type;
        const label = active.data.current.label;
        const position = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 };
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: { label, type },
        };
        addNode(newNode);
    }
  };

  const handleRun = () => {
    startExecution();
    graphEngine.start();
  };

  const handleStop = () => {
    stopExecution();
    graphEngine.stop();
  };

  const isRunning = executionContext.status === 'running';

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="flex h-full w-full relative">
            <Sidebar />
            <div className="flex-1 h-full relative bg-black/90">
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <Button
                        onClick={isRunning ? handleStop : handleRun}
                        variant={isRunning ? "destructive" : "default"}
                        className="font-bold font-mono uppercase shadow-xl border-2 border-white/20"
                    >
                        {isRunning ? <Stop weight="fill" className="mr-2" /> : <Play weight="fill" className="mr-2" />}
                        {isRunning ? "STOP_ENGINE" : "RUN_FLOW"}
                    </Button>
                </div>

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

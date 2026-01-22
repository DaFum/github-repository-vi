import { useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useFlowStore } from '@/store/flowStore'
import { nodeTypes } from './CustomNodes'
import { Sidebar } from './Sidebar'
import { ArchitectPanel } from './ArchitectPanel'
import { ExecutionTracker } from './ExecutionTracker'
import { DndContext } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import {
  Play,
  Stop,
  ShareNetwork,
  Eye,
  Dna,
  DownloadSimple,
  UploadSimple,
  Pulse,
  Brain,
} from '@phosphor-icons/react'
import { graphEngine } from '@/lib/graph/GraphEngine'
import { useFlowDragDrop } from '@/hooks/useFlowDragDrop'
import { useFlowFileOperations } from '@/hooks/useFlowFileOperations'
import { useFlowTools } from '@/hooks/useFlowTools'

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    startExecution,
    stopExecution,
    executionContext,
  } = useFlowStore()

  const [showTracker, setShowTracker] = useState(false)
  const [showArchitect, setShowArchitect] = useState(false)

  const { handleDragEnd } = useFlowDragDrop()
  const { fileInputRef, handleExport, handleImportClick, handleFileChange } =
    useFlowFileOperations()
  const { handleP2P, handleVision, handleEvolve } = useFlowTools()

  const handleRun = () => {
    startExecution()
    graphEngine.initialize()
    setShowTracker(true) // Auto-open tracker on execution
  }

  const handleStop = () => {
    stopExecution()
    graphEngine.dispose()
  }

  const isRunning = executionContext.status === 'running'

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative flex h-full w-full">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col bg-black/90">
          {/* Architect Panel */}
          {showArchitect && <ArchitectPanel />}

          {/* Main Canvas Area */}
          <div className="relative flex flex-1">
            <div className="relative flex-1">
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <Button
                  onClick={handleP2P}
                  variant="outline"
                  size="icon"
                  title="Neural Mesh (P2P)"
                  className="border-primary/50 text-primary hover:bg-primary/20"
                >
                  <ShareNetwork weight="bold" />
                </Button>
                <Button
                  onClick={handleVision}
                  variant="outline"
                  size="icon"
                  title="Ocular Cortex (Vision)"
                  className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20"
                >
                  <Eye weight="bold" />
                </Button>
                <Button
                  onClick={handleEvolve}
                  variant="outline"
                  size="icon"
                  title="Genetic Optimizer"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/20"
                >
                  <Dna weight="bold" />
                </Button>

                <div className="mx-2 h-8 w-px bg-white/20" />

                <Button
                  onClick={() => setShowArchitect(!showArchitect)}
                  variant={showArchitect ? 'default' : 'outline'}
                  size="icon"
                  title="AI Architect"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/20"
                >
                  <Brain weight="bold" />
                </Button>

                <Button
                  onClick={() => setShowTracker(!showTracker)}
                  variant={showTracker ? 'default' : 'outline'}
                  size="icon"
                  title="Execution Tracker"
                  className="border-accent/50 text-accent hover:bg-accent/20"
                >
                  <Pulse weight="bold" />
                </Button>

                <div className="mx-2 h-8 w-px bg-white/20" />

                <Button onClick={handleExport} variant="ghost" size="icon" title="Export Blueprint">
                  <DownloadSimple />
                </Button>
                <Button
                  onClick={handleImportClick}
                  variant="ghost"
                  size="icon"
                  title="Import Blueprint"
                >
                  <UploadSimple />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".zip"
                />

                <div className="mx-2 h-8 w-px bg-white/20" />

                <Button
                  onClick={isRunning ? handleStop : handleRun}
                  variant={isRunning ? 'destructive' : 'default'}
                  className="border-2 border-white/20 font-mono font-bold uppercase shadow-xl"
                >
                  {isRunning ? (
                    <Stop weight="fill" className="mr-2" />
                  ) : (
                    <Play weight="fill" className="mr-2" />
                  )}
                  {isRunning ? 'STOP_ENGINE' : 'RUN_FLOW'}
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

            {/* Execution Tracker */}
            <ExecutionTracker isOpen={showTracker} />
          </div>
        </div>
      </div>
    </DndContext>
  )
}

export const FlowEditor = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}

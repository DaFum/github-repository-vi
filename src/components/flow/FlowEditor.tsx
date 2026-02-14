import { useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useFlowStore } from '@/store/flowStore'
import { nodeTypes } from './CustomNodes'
import { Sidebar } from './Sidebar'
import { ArchitectPanel } from './ArchitectPanel'
import { ExecutionTracker } from './ExecutionTracker'
import { P2PMeshPanel } from '@/components/advanced/P2PMeshPanel'
import { VisionPanel } from '@/components/advanced/VisionPanel'
import { GeneticPanel } from '@/components/advanced/GeneticPanel'
import { DndContext } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Circuitry,
} from '@phosphor-icons/react'
import { graphEngine } from '@/lib/engine/GraphEngine'
import { useFlowDragDrop } from '@/hooks/useFlowDragDrop'
import { useFlowFileOperations } from '@/hooks/useFlowFileOperations'

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
  const [showP2P, setShowP2P] = useState(false)
  const [showVision, setShowVision] = useState(false)
  const [showGenetic, setShowGenetic] = useState(false)

  const { handleDragEnd } = useFlowDragDrop()
  const { fileInputRef, handleExport, handleImportClick, handleFileChange } =
    useFlowFileOperations()

  const handleRun = () => {
    try {
      graphEngine.initialize()
      startExecution()
      setShowTracker(true)
    } catch (error) {
      console.error('Failed to initialize graph engine:', error)
    }
  }

  const handleStop = () => {
    stopExecution()
    graphEngine.dispose()
  }

  const isRunning = executionContext.status === 'running'

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative flex h-full w-full font-share-tech overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col bg-black/90">

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-primary/20 bg-black/60 p-2 backdrop-blur z-20">
            <div className="flex items-center gap-2">
               <Badge variant="neon" className="gap-2">
                 <Circuitry size={14} weight="fill" />
                 SYNAPSE_CORE
               </Badge>
               <span className="text-[10px] text-primary/50 uppercase tracking-widest">
                  NODES: {nodes.length} | EDGES: {edges.length}
               </span>
            </div>
            <div className="flex items-center gap-2">
               <Button
                  onClick={isRunning ? handleStop : handleRun}
                  variant={isRunning ? 'destructive' : 'neon'}
                  size="sm"
                  className="font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                >
                  {isRunning ? (
                    <>
                      <Stop weight="fill" className="mr-2" /> STOP_ENGINE
                    </>
                  ) : (
                    <>
                      <Play weight="fill" className="mr-2" /> RUN_FLOW
                    </>
                  )}
                </Button>
            </div>
          </div>

          {/* Architect Panel Overlay */}
          {showArchitect && <ArchitectPanel />}

          {/* Main Canvas Area */}
          <div className="relative flex flex-1">
             {/* Toolbar Overlay */}
             <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 p-2 bg-black/60 border border-primary/20 backdrop-blur rounded-none shadow-xl">
                 <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setShowP2P(true)}
                      variant="holographic"
                      size="icon"
                      title="Neural Mesh (P2P)"
                      aria-label="Neural Mesh (P2P)"
                      className="text-primary"
                    >
                      <ShareNetwork weight="bold" />
                    </Button>
                    <Button
                      onClick={() => setShowVision(true)}
                      variant="holographic"
                      size="icon"
                      title="Ocular Cortex"
                      aria-label="Ocular Cortex"
                      className="text-blue-400 border-blue-400/30"
                    >
                      <Eye weight="bold" />
                    </Button>
                    <Button
                      onClick={() => setShowGenetic(true)}
                      variant="holographic"
                      size="icon"
                      title="Genetic Optimizer"
                      aria-label="Genetic Optimizer"
                      className="text-purple-400 border-purple-400/30"
                    >
                      <Dna weight="bold" />
                    </Button>
                 </div>

                 <div className="h-px w-full bg-primary/20" />

                 <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setShowArchitect(!showArchitect)}
                      variant={showArchitect ? 'neon' : 'holographic'}
                      size="icon"
                      title="AI Architect"
                      aria-label="AI Architect"
                    >
                      <Brain weight="bold" />
                    </Button>
                    <Button
                      onClick={() => setShowTracker(!showTracker)}
                      variant={showTracker ? 'neon' : 'holographic'}
                      size="icon"
                      title="Execution Tracker"
                      aria-label="Execution Tracker"
                    >
                      <Pulse weight="bold" />
                    </Button>
                 </div>

                 <div className="h-px w-full bg-primary/20" />

                 <div className="flex gap-2 justify-end">
                    <Button onClick={handleExport} variant="ghost" size="icon" title="Export" aria-label="Export">
                      <DownloadSimple />
                    </Button>
                    <Button onClick={handleImportClick} variant="ghost" size="icon" title="Import" aria-label="Import">
                      <UploadSimple />
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".zip" />
                 </div>
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
                className="bg-black/80"
              >
                <Background color="#1a2236" gap={24} size={1} />
                <Controls className="!bg-black/80 !border-primary/30 !rounded-none [&>button]:!border-b-primary/30 [&>button]:!text-primary [&>button:hover]:!bg-primary/20" />
                <MiniMap
                   className="!bg-black/90 !border-primary/30 !rounded-none"
                   maskColor="rgba(0, 0, 0, 0.6)"
                   nodeColor="#00f3ff"
                />
              </ReactFlow>


            {/* Execution Tracker */}
            <ExecutionTracker isOpen={showTracker} />
          </div>
        </div>
      </div>

      {/* Advanced Feature Panels */}
      <P2PMeshPanel isOpen={showP2P} onClose={() => setShowP2P(false)} />
      <VisionPanel isOpen={showVision} onClose={() => setShowVision(false)} />
      <GeneticPanel isOpen={showGenetic} onClose={() => setShowGenetic(false)} />
    </DndContext>
  )
}

/**
 * Main Flow Editor component.
 * Provides the canvas for designing and executing agent workflows.
 */
export const FlowEditor = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}

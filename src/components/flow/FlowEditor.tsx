import { useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useFlowStore } from '@/store/flowStore'
import { nodeTypes } from './CustomNodes'
import { Sidebar } from './Sidebar'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import {
  Play,
  Stop,
  ShareNetwork,
  Eye,
  Dna,
  DownloadSimple,
  UploadSimple,
} from '@phosphor-icons/react'
import { graphEngine } from '@/lib/graph/GraphEngine'
import { BlueprintRegistry } from '@/lib/store/BlueprintRegistry'
import { createP2PClient } from '@/lib/mesh/P2PClient'
import { createScreenWatcher } from '@/lib/vision/ScreenWatcher'
import { GeneticPrompt } from '@/lib/optimizer/GeneticPrompt'
import { toast } from 'sonner'

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    startExecution,
    stopExecution,
    executionContext,
  } = useFlowStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    if (active.data.current) {
      const type = active.data.current.type
      const label = active.data.current.label
      const position = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 }
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label, type },
      }
      addNode(newNode)
    }
  }

  const handleRun = () => {
    startExecution()
    graphEngine.initialize()
  }

  const handleStop = () => {
    stopExecution()
    graphEngine.dispose()
  }

  const handleExport = () => BlueprintRegistry.exportBlueprint()

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const success = await BlueprintRegistry.importBlueprint(file)
      if (success) toast.success('Blueprint Imported')
      else toast.error('Import Failed')
    }
  }

  const handleP2P = () => {
    const p2p = createP2PClient(true)
    p2p.initialize()
    toast.info('P2P Mesh Initialized (Console for Signal)')
  }

  const handleVision = () => {
    const watcher = createScreenWatcher()
    watcher.initialize()
    toast.info('Ocular Cortex Active')
  }

  const handleEvolve = async () => {
    toast.info('Genetic Optimization Started...')
    // Mock prompt evolution
    const optimized = await GeneticPrompt.evolve('Write a tweet', 'Viral, under 280 chars')
    console.log('Optimized Prompt:', optimized)
    toast.success('Optimization Complete')
  }

  const isRunning = executionContext.status === 'running'

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative flex h-full w-full">
        <Sidebar />
        <div className="relative h-full flex-1 bg-black/90">
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

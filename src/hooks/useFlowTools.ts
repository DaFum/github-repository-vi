import { createP2PClient } from '@/lib/mesh/P2PClient'
import { createScreenWatcher } from '@/lib/vision/ScreenWatcher'
import { GeneticPrompt } from '@/lib/optimizer/GeneticPrompt'
import { toast } from 'sonner'

export const useFlowTools = () => {
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

  return { handleP2P, handleVision, handleEvolve }
}

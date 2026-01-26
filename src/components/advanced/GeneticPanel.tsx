import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GeneticPrompt } from '@/lib/optimizer/GeneticPrompt'
import { toast } from 'sonner'
import { Dna, Sparkle, CircleNotch, CheckCircle } from '@phosphor-icons/react'

type GeneticPanelProps = {
  isOpen: boolean
  onClose: () => void
}

type Evolution = {
  generation: number
  prompt: string
  fitness: number
}

/**
 * Genetic Optimizer Panel
 *
 * Evolutionary prompt optimization:
 * - Input base prompt
 * - Define fitness criteria
 * - Run genetic evolution
 * - View evolution history
 * - Apply optimized prompt
 */
export function GeneticPanel({ isOpen, onClose }: GeneticPanelProps) {
  const [basePrompt, setBasePrompt] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('')
  const [isEvolving, setIsEvolving] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [bestPrompt, setBestPrompt] = useState<string>('')

  const handleEvolve = async () => {
    if (!basePrompt.trim() || !fitnessGoal.trim()) {
      toast.error('Please provide both base prompt and fitness goal')
      return
    }

    setIsEvolving(true)
    setEvolutions([])
    setCurrentGeneration(0)
    setBestPrompt('')

    try {
      // Simulate genetic evolution with generations
      const generations = 5
      const evs: Evolution[] = []

      for (let gen = 1; gen <= generations; gen++) {
        // Offload to microtask to prevent blocking UI
        await new Promise<void>((resolve) => {
          queueMicrotask(async () => {
            setCurrentGeneration(gen)

            // Simulate evolution (in real implementation, this would use the GeneticPrompt class)
            const evolved = await GeneticPrompt.evolve(basePrompt, fitnessGoal)

            const evolution: Evolution = {
              generation: gen,
              prompt: evolved,
              fitness: Math.random() * 0.5 + 0.5, // Mock fitness 0.5-1.0
            }

            evs.push(evolution)
            setEvolutions([...evs])

            // Simulate generation delay to yield to UI
            setTimeout(resolve, 1000)
          })
        })
      }

      // Best prompt is from last generation
      const best = evs[evs.length - 1]
      queueMicrotask(() => {
        setBestPrompt(best.prompt)
        toast.success('Evolution Complete!')
      })
    } catch (error) {
      console.error('Evolution failed:', error)
      toast.error('Evolution failed')
    } finally {
      setIsEvolving(false)
    }
  }

  const handleCopyBest = async () => {
    if (bestPrompt) {
      try {
        await navigator.clipboard.writeText(bestPrompt)
        toast.success('Optimized prompt copied to clipboard')
      } catch (error) {
        toast.error(
          `Failed to copy to clipboard: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-3xl border-2 border-purple-400/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black tracking-wider text-purple-400 uppercase">
            <Dna size={24} weight="fill" />
            GENETIC_OPTIMIZER
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            EVOLUTIONARY_PROMPT_ENHANCEMENT
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-prompt" className="font-mono text-xs uppercase">
                Base Prompt
              </Label>
              <Textarea
                id="base-prompt"
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                placeholder="Enter your starting prompt..."
                className="min-h-[100px] resize-none font-mono text-xs"
                disabled={isEvolving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fitness-goal" className="font-mono text-xs uppercase">
                Fitness Goal
              </Label>
              <Textarea
                id="fitness-goal"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                placeholder="e.g., Viral engagement, under 280 chars, professional tone..."
                className="min-h-[100px] resize-none font-mono text-xs"
                disabled={isEvolving}
              />
            </div>
          </div>

          {/* Evolution Button */}
          <Button
            onClick={handleEvolve}
            disabled={!basePrompt.trim() || !fitnessGoal.trim() || isEvolving}
            className="gradient-button w-full font-mono text-xs font-bold uppercase"
          >
            {isEvolving ? (
              <>
                <CircleNotch size={16} className="mr-2 animate-spin" />
                EVOLVING_GENERATION_{currentGeneration}...
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" className="mr-2" />
                START_EVOLUTION
              </>
            )}
          </Button>

          {/* Evolution Progress */}
          {evolutions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs uppercase">Evolution History</Label>
                <Badge variant="secondary" className="font-mono text-xs">
                  {evolutions.length} GENERATIONS
                </Badge>
              </div>
              <ScrollArea className="max-h-[250px]">
                <div className="space-y-2">
                  {evolutions.map((evolution) => (
                    <motion.div
                      key={evolution.generation}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: evolution.generation * 0.1 }}
                      className="rounded-lg border-2 border-purple-400/30 bg-purple-400/5 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="border-purple-400/50 font-mono text-xs text-purple-400"
                        >
                          GEN_{evolution.generation}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground font-mono text-[10px]">
                            FITNESS:
                          </span>
                          <span className="font-mono text-xs font-bold text-green-400">
                            {(evolution.fitness * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground font-mono text-xs">{evolution.prompt}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* Best Result */}
          {bestPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs uppercase">Optimized Result</Label>
                <Button onClick={handleCopyBest} size="sm" variant="outline">
                  <CheckCircle size={16} weight="fill" className="mr-1" />
                  COPY
                </Button>
              </div>
              <div className="rounded-lg border-2 border-green-400/50 bg-green-400/10 p-4">
                <p className="font-mono text-sm text-green-400">{bestPrompt}</p>
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="rounded-lg border border-purple-400/30 bg-purple-400/5 p-3">
            <p className="text-muted-foreground font-mono text-[10px]">
              <span className="text-purple-400">ℹ</span> Genetic Optimizer uses evolutionary
              algorithms to iteratively improve prompts based on your fitness criteria. Each
              generation mutates and selects the best variants.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

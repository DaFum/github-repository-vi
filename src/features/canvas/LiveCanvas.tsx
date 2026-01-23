import { useState } from 'react'
import { motion } from 'framer-motion'
import { PreviewPane } from './PreviewPane'
import { RenderPane } from './RenderPane'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Lightning } from '@phosphor-icons/react'

/**
 * Live Canvas Module
 *
 * Split-screen image generator with dual-model system:
 * - Left: Fast preview (turbo/schnell) with debounced generation
 * - Right: High-quality render (flux/midjourney) on demand
 */
export function LiveCanvas() {
  const [prompt, setPrompt] = useState('')
  const [previewModel, setPreviewModel] = useState('turbo')
  const [renderModel, setRenderModel] = useState('flux')
  const [seed, setSeed] = useState<number | undefined>(undefined)

  return (
    <div className="module-canvas border-primary/30 glass-card corner-accent glow-border relative h-[calc(100vh-280px)] min-h-[600px] overflow-hidden rounded-lg border-2">
      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b bg-black/50 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="badge-canvas font-mono text-xs">
            <Lightning size={12} weight="fill" className="mr-1" />
            LIVE_CANVAS
          </Badge>
          <span className="text-muted-foreground font-mono text-xs">
            <span className="text-primary">{'>'}</span> DUAL_MODEL_RENDERING
          </span>
        </div>

        <Badge variant="outline" className="text-accent border-accent/50 font-mono text-xs">
          <Sparkle size={12} weight="fill" className="mr-1" />
          {seed ? `SEED_${seed}` : 'RANDOM_SEED'}
        </Badge>
      </div>

      {/* Split Screen */}
      <div className="grid h-[calc(100%-48px)] grid-cols-1 lg:grid-cols-2">
        {/* Preview Pane (Left) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="border-border/50 lg:border-r"
        >
          <PreviewPane
            prompt={prompt}
            onPromptChange={setPrompt}
            model={previewModel}
            onModelChange={setPreviewModel}
            seed={seed}
            onSeedChange={setSeed}
          />
        </motion.div>

        {/* Render Pane (Right) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <RenderPane
            prompt={prompt}
            model={renderModel}
            onModelChange={setRenderModel}
            seed={seed}
          />
        </motion.div>
      </div>
    </div>
  )
}

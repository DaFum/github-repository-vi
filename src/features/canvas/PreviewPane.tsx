import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ModelSelector } from '@/components/ModelSelector'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pollinations } from '@/lib/pollinations'
import { CircleNotch, Lightning, Warning } from '@phosphor-icons/react'

type PreviewPaneProps = {
  prompt: string
  onPromptChange: (prompt: string) => void
  model: string
  onModelChange: (model: string) => void
  seed?: number
  onSeedChange: (seed: number | undefined) => void
}

/**
 * Preview Pane
 *
 * Fast, debounced preview generation with turbo/schnell models.
 * Updates automatically as the user types.
 */
export function PreviewPane({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  seed,
  onSeedChange,
}: PreviewPaneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seedInput, setSeedInput] = useState('')
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  const generatePreview = useCallback(async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const url = pollinations.generateImageUrl({
        prompt,
        model,
        width: 512,
        height: 512,
        seed,
      })

      // Preload image to detect errors
      const img = new Image()
      img.onload = () => {
        setPreviewUrl(url)
        setIsGenerating(false)
      }
      img.onerror = () => {
        setError('Failed to generate preview')
        setIsGenerating(false)
      }
      img.src = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsGenerating(false)
    }
  }, [prompt, model, seed])

  // Debounced preview generation
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!prompt.trim()) {
      return
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      generatePreview()
    }, 1000) // 1 second debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [prompt, model, seed, generatePreview])

  const handleSeedChange = (value: string) => {
    setSeedInput(value)
    if (value === '') {
      onSeedChange(undefined)
    } else {
      const parsed = parseInt(value, 10)
      if (!isNaN(parsed)) {
        onSeedChange(parsed)
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="border-border/50 space-y-3 border-b bg-black/30 p-4 backdrop-blur">
        <div>
          <Label htmlFor="preview-prompt" className="font-mono text-xs uppercase">
            <Lightning size={12} weight="fill" className="mr-1 mb-1 inline" />
            Fast Preview Prompt
          </Label>
          <Textarea
            id="preview-prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="A cyberpunk city at sunset..."
            className="font-mono text-sm"
            rows={3}
          />
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            <span className="text-primary">{'>'}</span> Auto-generates after 1s pause
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="font-mono text-xs uppercase">Preview Model</Label>
            <ModelSelector type="image" value={model} onChange={onModelChange} />
          </div>

          <div>
            <Label htmlFor="seed" className="font-mono text-xs uppercase">
              Seed (Optional)
            </Label>
            <Input
              id="seed"
              type="number"
              value={seedInput}
              onChange={(e) => handleSeedChange(e.target.value)}
              placeholder="Random"
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Preview Display */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/20 p-4">
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <CircleNotch size={48} className="text-primary mx-auto mb-4 animate-spin" />
              <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs">
                GENERATING_PREVIEW...
              </Badge>
            </motion.div>
          )}

          {error && !isGenerating && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Warning size={48} className="text-destructive mx-auto mb-4" />
              <Badge variant="destructive" className="font-mono text-xs">
                ERROR: {error}
              </Badge>
            </motion.div>
          )}

          {previewUrl && !isGenerating && !error && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative h-full w-full"
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="border-primary/30 h-full w-full rounded-lg border-2 object-contain shadow-2xl"
              />
              <Badge
                variant="outline"
                className="border-primary/50 text-primary absolute top-2 left-2 bg-black/70 font-mono text-xs backdrop-blur"
              >
                <Lightning size={12} weight="fill" className="mr-1" />
                PREVIEW_{model.toUpperCase()}
              </Badge>
            </motion.div>
          )}

          {!prompt.trim() && !isGenerating && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Lightning size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground font-mono text-sm">
                <span className="text-primary">{'>'}</span> TYPE_PROMPT_TO_START
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

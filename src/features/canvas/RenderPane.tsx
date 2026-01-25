import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModelSelector } from '@/components/ModelSelector'
import { Label } from '@/components/ui/label'
import { pollinations } from '@/lib/pollinations'
import { useVaultStore } from '@/lib/store/useVaultStore'
import { CircleNotch, Sparkle, Download, Warning, Archive } from '@phosphor-icons/react'
import { toast } from 'sonner'

type RenderPaneProps = {
  prompt: string
  model: string
  onModelChange: (model: string) => void
  seed?: number
}

/**
 * Render Pane
 *
 * High-quality rendering with premium models (flux, midjourney).
 * Manual trigger for final output.
 */
export function RenderPane({ prompt, model, onModelChange, seed }: RenderPaneProps) {
  const [renderUrl, setRenderUrl] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addArtifact } = useVaultStore()
  const renderRequestIdRef = useRef(0)

  const generateRender = async () => {
    if (!prompt.trim()) {
      setError('Prompt is required')
      return
    }

    setIsRendering(true)
    setError(null)

    const requestId = ++renderRequestIdRef.current

    try {
      const url = await pollinations.generateImage(prompt, {
        model,
        width: 1024,
        height: 1024,
        seed,
      })

      // Preload image to detect errors
      const img = new Image()
      img.onload = () => {
        if (requestId === renderRequestIdRef.current) {
          setRenderUrl(url)
          setIsRendering(false)

          // Auto-save to vault
          addArtifact({
            type: 'image',
            title: prompt.slice(0, 50),
            description: `Generated with ${model}`,
            model,
            tags: ['canvas', 'hq-render'],
            data: {
              imageUrl: url,
              prompt,
              seed,
              resolution: '1024x1024',
            },
          })
          toast.success('Saved to Vault!', { icon: <Archive size={16} /> })
        }
      }
      img.onerror = () => {
        if (requestId === renderRequestIdRef.current) {
          setError(`Failed to generate render for ${url}`)
          setIsRendering(false)
        }
      }
      img.src = url
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to generate render: ${err.message}`
          : `Failed to generate render: ${String(err)}`
      )
      setIsRendering(false)
    }
  }

  const downloadRender = () => {
    if (!renderUrl) return

    const link = document.createElement('a')
    link.href = renderUrl
    link.download = `render_${Date.now()}.png`
    link.click()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="border-border/50 space-y-3 border-b bg-black/30 p-4 backdrop-blur">
        <div>
          <Label className="font-mono text-xs uppercase">Render Model (HQ)</Label>
          <ModelSelector type="image" value={model} onChange={onModelChange} />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={generateRender}
            disabled={!prompt.trim() || isRendering}
            className="gradient-button flex-1 font-mono text-xs font-bold uppercase"
          >
            {isRendering ? (
              <>
                <CircleNotch size={16} className="mr-2 animate-spin" />
                RENDERING...
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" className="mr-2" />
                RENDER_HQ
              </>
            )}
          </Button>

          {renderUrl && (
            <Button
              onClick={downloadRender}
              variant="outline"
              size="icon"
              className="border-primary/50 text-primary"
            >
              <Download size={16} weight="bold" />
            </Button>
          )}
        </div>

        {!prompt.trim() && (
          <p className="text-muted-foreground font-mono text-xs">
            <span className="text-primary">{'>'}</span> Enter prompt in preview pane first
          </p>
        )}
      </div>

      {/* Render Display */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/20 p-4">
        <AnimatePresence mode="wait">
          {isRendering && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <CircleNotch size={64} className="text-accent mx-auto mb-4 animate-spin" />
              <Badge
                variant="outline"
                className="text-accent border-accent/50 mb-2 font-mono text-xs"
              >
                RENDERING_HIGH_QUALITY...
              </Badge>
              <p className="text-muted-foreground font-mono text-xs">This may take 10-30 seconds</p>
            </motion.div>
          )}

          {error && !isRendering && (
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

          {renderUrl && !isRendering && !error && (
            <motion.div
              key="render"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative h-full w-full"
            >
              <img
                src={renderUrl}
                alt="High Quality Render"
                className="border-accent/50 h-full w-full rounded-lg border-2 object-contain shadow-2xl"
              />
              <Badge
                variant="outline"
                className="text-accent border-accent/50 absolute top-2 left-2 bg-black/70 font-mono text-xs backdrop-blur"
              >
                <Sparkle size={12} weight="fill" className="mr-1" />
                HQ_RENDER_{model.toUpperCase()}
              </Badge>
            </motion.div>
          )}

          {!renderUrl && !isRendering && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Sparkle size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground mb-2 font-mono text-sm">
                <span className="text-primary">{'>'}</span> CLICK_RENDER_HQ_TO_START
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                High-quality 1024x1024 generation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

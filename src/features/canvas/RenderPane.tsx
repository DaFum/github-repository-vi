import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModelSelector } from '@/components/ModelSelector'
import { Label } from '@/components/ui/label'
import { pollinations } from '@/lib/pollinations'
import { useVaultStore } from '@/lib/store/useVaultStore'
import { CircleNotch, Sparkle, Download, Warning, Archive, Aperture, CornersOut } from '@phosphor-icons/react'
import { toast } from 'sonner'

type RenderPaneProps = {
  prompt: string
  model: string
  onModelChange: (model: string) => void
  seed?: number
}

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
      const url = await pollinations.generateImage(prompt, { model, width: 1024, height: 1024, seed })
      const img = new Image()
      img.onload = () => {
        if (requestId === renderRequestIdRef.current) {
          setRenderUrl(url)
          setIsRendering(false)
          addArtifact({
            type: 'image',
            title: prompt.slice(0, 50),
            description: `Generated with ${model}`,
            model,
            tags: ['canvas', 'hq-render'],
            data: { imageUrl: url, prompt, seed, resolution: '1024x1024' },
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
      setError(err instanceof Error ? err.message : String(err))
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
    <div className="flex h-full flex-col font-share-tech">
      {/* Control Panel */}
      <div className="border-b border-primary/20 bg-black/40 backdrop-blur p-4 space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-1">
            <Label className="text-[10px] text-primary/70 uppercase tracking-widest">Render Model</Label>
            <ModelSelector type="image" value={model} onChange={onModelChange} />
          </div>
          <div className="flex gap-2">
             <Button
              onClick={generateRender}
              disabled={!prompt.trim() || isRendering}
              variant="default"
              className="flex-1 min-w-[140px]"
            >
              {isRendering ? (
                <>
                  <CircleNotch size={16} className="mr-2 animate-spin" />
                  PROCESSING
                </>
              ) : (
                <>
                  <Aperture size={16} className="mr-2" />
                  RENDER_HQ
                </>
              )}
            </Button>
            {renderUrl && (
              <Button onClick={downloadRender} variant="outline" size="icon" title="Download">
                <Download size={16} />
              </Button>
            )}
          </div>
        </div>
        {!prompt.trim() && (
          <div className="flex items-center gap-2 text-xs text-destructive/80 bg-destructive/10 p-2 border border-destructive/20">
            <Warning size={14} />
            <span>MISSING_INPUT_SIGNAL: Enter prompt in preview pane</span>
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="relative flex-1 bg-black/80 flex items-center justify-center overflow-hidden group">

        {/* Viewport Overlay UI */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-30">
           {/* Crosshairs */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-primary/30" />
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10" />
           <div className="absolute top-0 left-1/2 h-full w-[1px] bg-primary/10" />

           {/* Corner Brackets */}
           <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
           <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/40" />
           <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/40" />
           <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/40" />

           <div className="absolute bottom-6 right-6 text-[10px] text-primary/50 font-mono">
             VP_RES: 1024x1024_PX
           </div>
        </div>

        <AnimatePresence mode="wait">
          {isRendering && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center z-30"
            >
              <div className="relative mb-4 mx-auto w-16 h-16">
                 <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                 <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
              </div>
              <Badge variant="neon" className="animate-pulse">RENDERING_SEQUENCE_INITIATED</Badge>
            </motion.div>
          )}

          {error && !isRendering && (
             <motion.div key="error" className="text-center z-30 max-w-md p-6 border border-destructive/50 bg-black/90">
                <Warning size={48} className="text-destructive mx-auto mb-4" />
                <h3 className="text-destructive font-orbitron mb-2">RENDERING_FAILED</h3>
                <p className="text-destructive/80 text-xs font-mono">{error}</p>
             </motion.div>
          )}

          {renderUrl && !isRendering && !error && (
            <motion.div
              key="render"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-full w-full p-8"
            >
              <img
                src={renderUrl}
                alt="HQ Render"
                className="w-full h-full object-contain shadow-2xl border border-primary/20 bg-black"
              />
              <div className="absolute top-10 left-10">
                <Badge variant="solid" className="shadow-lg">
                  HQ_OUTPUT_READY
                </Badge>
              </div>
            </motion.div>
          )}

          {!renderUrl && !isRendering && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-primary/30 z-10"
            >
              <CornersOut size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm tracking-widest">AWAITING_INPUT_STREAM</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

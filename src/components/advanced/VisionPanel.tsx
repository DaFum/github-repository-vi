import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createScreenWatcher } from '@/lib/vision/ScreenWatcher'
import { toast } from 'sonner'
import { Eye, Camera, CircleNotch, CheckCircle } from '@phosphor-icons/react'

type VisionPanelProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * Ocular Cortex Vision Panel
 *
 * Screen watching and visual analysis:
 * - Enable/disable screen watching
 * - Configure capture interval
 * - View latest captures
 * - Visual context for AI
 */
export function VisionPanel({ isOpen, onClose }: VisionPanelProps) {
  const [isWatching, setIsWatching] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)
  const [lastCapture, setLastCapture] = useState<string | null>(null)
  const [watcher] = useState(() => createScreenWatcher())

  useEffect(() => {
    if (isOpen && isWatching) {
      // Listen for captures
      watcher.on('capture', (imageData: string) => {
        setLastCapture(imageData)
        setCaptureCount((prev) => prev + 1)
      })
    }

    return () => {
      // Cleanup listeners
    }
  }, [isOpen, isWatching, watcher])

  const handleToggleWatching = async () => {
    if (!isWatching) {
      setIsInitializing(true)
      try {
        await watcher.initialize()
        setIsWatching(true)
        toast.success('Ocular Cortex Active')
      } catch (error) {
        console.error('Failed to initialize screen watcher:', error)
        toast.error('Failed to start screen watching')
      } finally {
        setIsInitializing(false)
      }
    } else {
      watcher.stop()
      setIsWatching(false)
      toast.info('Ocular Cortex Disabled')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl border-2 border-blue-400/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black tracking-wider text-blue-400 uppercase">
            <Eye size={24} weight="fill" />
            OCULAR_CORTEX
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            VISUAL_CONTEXT_AWARENESS_SYSTEM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Toggle Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs uppercase">Screen Watching</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isWatching}
                  onCheckedChange={handleToggleWatching}
                  disabled={isInitializing}
                />
                <Badge variant={isWatching ? 'default' : 'secondary'} className="font-mono text-xs">
                  {isInitializing ? (
                    <>
                      <CircleNotch size={12} className="mr-1 animate-spin" />
                      INITIALIZING...
                    </>
                  ) : isWatching ? (
                    <>
                      <CheckCircle size={12} weight="fill" className="mr-1" />
                      ACTIVE
                    </>
                  ) : (
                    'INACTIVE'
                  )}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground font-mono text-[10px]">
              <span className="text-primary">{'>'}</span> Enable to allow AI to see your screen
              context
            </p>
          </div>

          {/* Stats */}
          {isWatching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border-2 border-blue-400/30 bg-blue-400/5 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <Camera size={16} className="text-blue-400" />
                <span className="font-mono text-xs font-bold text-blue-400 uppercase">
                  CAPTURE_STATISTICS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase">
                    Total Captures
                  </div>
                  <div className="text-primary font-mono text-lg font-bold">{captureCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase">
                    Status
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="font-mono text-xs text-green-400">MONITORING</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Latest Capture Preview */}
          {lastCapture && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label className="font-mono text-xs uppercase">Latest Capture</Label>
              <div className="border-border/50 overflow-hidden rounded-lg border-2 bg-black/20">
                <img
                  src={lastCapture}
                  alt="Latest screen capture"
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="text-muted-foreground font-mono text-[10px]">
                <span className="text-primary">{'>'}</span> This visual context is available to AI
                agents
              </p>
            </motion.div>
          )}

          {/* Info */}
          <div className="rounded-lg border border-blue-400/30 bg-blue-400/5 p-3">
            <p className="text-muted-foreground font-mono text-[10px]">
              <span className="text-blue-400">ℹ</span> Ocular Cortex captures periodic screenshots
              to provide visual context to AI agents. All processing happens locally in your
              browser.
            </p>
          </div>

          {/* Permissions Notice */}
          {!isWatching && (
            <div className="border-accent/30 bg-accent/5 rounded-lg border p-3">
              <p className="text-muted-foreground font-mono text-[10px]">
                <span className="text-accent">⚠</span> Browser will request screen capture
                permission when activated
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="font-mono text-xs uppercase">
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

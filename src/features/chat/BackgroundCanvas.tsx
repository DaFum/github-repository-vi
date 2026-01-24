import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pollinations } from '@/lib/pollinations'
import type { VisualizationCommand } from './HoloChat'

type BackgroundCanvasProps = {
  visualization: VisualizationCommand | null
}

/**
 * Background Canvas Component
 *
 * Displays AI-controlled visualizations in the background:
 * - Images generated from prompts
 * - Plots/diagrams (future)
 * - Animated transitions
 */
export function BackgroundCanvas({ visualization }: BackgroundCanvasProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (
      !visualization ||
      visualization.type !== 'image' ||
      typeof visualization.data !== 'string'
    ) {
      // Clear previous background when visualization is null or not an image
      queueMicrotask(() => {
        setImageUrl('')
        setIsLoading(false)
      })
      return
    }

    // Generate image URL
    const url = pollinations.generateImageUrl({
      prompt: visualization.data,
      model: 'flux',
      width: 1024,
      height: 1024,
    })

    // Preload image
    const img = new Image()

    const handleLoad = () => {
      setImageUrl(url)
      setIsLoading(false)
    }
    const handleError = () => {
      setImageUrl('')
      setIsLoading(false)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    // Start preload
    queueMicrotask(() => setIsLoading(true))
    img.src = url

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
      img.src = '' // Stop preload
    }
  }, [visualization])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {imageUrl && (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            <img
              src={imageUrl}
              alt="AI Visualization"
              className="h-full w-full object-cover blur-sm"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />
          </motion.div>
        )}

        {!imageUrl && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full w-full items-center justify-center"
          >
            {/* Default cyberpunk grid background */}
            <div className="cyber-grid h-full w-full opacity-10" />
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full w-full items-center justify-center bg-black/50"
          >
            <div className="text-accent font-mono text-sm">GENERATING_VISUALIZATION...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

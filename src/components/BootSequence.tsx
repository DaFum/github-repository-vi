import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

type BootSequenceProps = {
  onComplete: () => void
}

const bootMessages = [
  '> INITIALIZING_NEURAL_CORTEX...',
  '> LOADING_AGENT_PROTOCOLS...',
  '> ESTABLISHING_MESH_NETWORK...',
  '> CALIBRATING_VISUAL_SYSTEMS...',
  '> SYNCING_QUANTUM_STATES...',
  '> MOUNTING_EXECUTION_ENGINE...',
]

/**
 * Boot Sequence Component
 *
 * Dramatic system boot animation with:
 * - Terminal-style boot messages
 * - Grain texture overlay
 * - Geometric patterns
 * - Orchestrated reveals
 * - Neon glow effects
 */
export function BootSequence({ onComplete }: BootSequenceProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    // Boot messages sequence
    if (messageIndex < bootMessages.length) {
      const timer = setTimeout(() => {
        setMessageIndex((prev) => prev + 1)
      }, 400)
      return () => clearTimeout(timer)
    } else {
      // Show logo after all messages
      const logoTimer = setTimeout(() => {
        setShowLogo(true)
      }, 500)

      // Complete sequence
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 3500)

      return () => {
        clearTimeout(logoTimer)
        clearTimeout(completeTimer)
      }
    }
  }, [messageIndex, onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Grain Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial Gradient Mesh */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, oklch(0.78 0.25 168 / 0.2) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, oklch(0.75 0.28 330 / 0.15) 0%, transparent 40%),
                       radial-gradient(circle at 20% 80%, oklch(0.75 0.28 330 / 0.15) 0%, transparent 40%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4">
        {/* Boot Messages */}
        <div className="h-[200px] space-y-2">
          <AnimatePresence mode="popLayout">
            {bootMessages.slice(0, messageIndex).map((message, index) => (
              <motion.div
                key={message}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                className="text-primary font-mono text-sm tracking-wider"
                style={{
                  textShadow: '0 0 10px oklch(0.78 0.25 168 / 0.5)',
                }}
              >
                {message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Logo Reveal */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center"
            >
              {/* Decorative Top Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '300px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="via-primary mb-6 h-[2px] bg-gradient-to-r from-transparent to-transparent"
                style={{
                  boxShadow: '0 0 20px oklch(0.78 0.25 168 / 0.8)',
                }}
              />

              {/* Main Logo */}
              <motion.h1
                className="neon-text mb-4 font-black tracking-tighter"
                style={{
                  fontSize: 'clamp(3rem, 10vw, 6rem)',
                  textShadow: `
                    0 0 10px oklch(0.78 0.25 168 / 1),
                    0 0 20px oklch(0.78 0.25 168 / 0.8),
                    0 0 40px oklch(0.78 0.25 168 / 0.6),
                    0 0 80px oklch(0.78 0.25 168 / 0.4)
                  `,
                  background: `linear-gradient(135deg,
                    oklch(0.78 0.25 168) 0%,
                    oklch(0.75 0.28 330) 50%,
                    oklch(0.78 0.25 168) 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AETHER_OS
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-muted-foreground font-mono text-sm tracking-widest"
              >
                VISUAL_AGENT_ORCHESTRATOR
              </motion.p>

              {/* Decorative Bottom Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '300px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="via-accent mt-6 h-[2px] bg-gradient-to-r from-transparent to-transparent"
                style={{
                  boxShadow: '0 0 20px oklch(0.75 0.28 330 / 0.8)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-primary/30 w-[300px] overflow-hidden rounded-full border bg-black/50 p-1 backdrop-blur"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2.5,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="from-primary via-accent to-primary h-1 rounded-full bg-gradient-to-r"
            style={{
              boxShadow: '0 0 10px oklch(0.78 0.25 168 / 0.8)',
            }}
          />
        </motion.div>
      </div>

      {/* Corner Decorations (Art Deco) */}
      <svg
        className="pointer-events-none absolute top-0 left-0 h-32 w-32 opacity-20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 L50 0 L0 50 Z"
          fill="url(#corner-gradient)"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-primary"
        />
        <defs>
          <linearGradient id="corner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.78 0.25 168 / 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rotate-180 opacity-20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 L50 0 L0 50 Z"
          fill="url(#corner-gradient-2)"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-accent"
        />
        <defs>
          <linearGradient id="corner-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.28 330 / 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

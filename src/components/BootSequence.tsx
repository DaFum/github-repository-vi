import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Circuitry, Cpu, Globe, WifiHigh } from '@phosphor-icons/react'

type BootSequenceProps = {
  onComplete: () => void
}

const bootSteps = [
  { text: 'INITIALIZING_NEURAL_CORTEX', icon: Circuitry },
  { text: 'LOADING_AGENT_PROTOCOLS', icon: Cpu },
  { text: 'ESTABLISHING_MESH_NETWORK', icon: Globe },
  { text: 'CALIBRATING_VISUAL_SYSTEMS', icon: WifiHigh },
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (stepIndex < bootSteps.length) {
      const timeout = setTimeout(() => {
        setStepIndex((prev) => prev + 1)
      }, 800) // Slower, more deliberate steps
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setTimeout(onComplete, 1000)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [stepIndex, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-mono text-primary overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      style={{ backgroundColor: '#000000' }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      {/* Background Grid & Scanlines */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="scanlines" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_120%)]" />

      <div className="relative z-10 w-full max-w-lg px-8">
        {/* Main Logo Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-primary/50 font-orbitron drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
            AETHER_OS
          </h1>
          <div className="mt-2 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        </motion.div>

        {/* Terminal Output */}
        <div className="space-y-4 font-share-tech text-sm">
          {bootSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: stepIndex >= index ? 1 : 0,
                x: stepIndex >= index ? 0 : -20,
                color: stepIndex === index ? 'var(--primary)' : 'var(--muted-foreground)'
              }}
              className="flex items-center gap-3"
            >
              <step.icon
                size={18}
                className={stepIndex === index ? "animate-spin text-accent" : ""}
                weight={stepIndex === index ? "fill" : "regular"}
              />
              <span className="tracking-widest">
                {step.text}
                {stepIndex === index && <span className="animate-pulse">_</span>}
              </span>
              {stepIndex > index && <span className="ml-auto text-accent text-xs">[OK]</span>}
            </motion.div>
          ))}
        </div>

        {/* Loading Bar */}
        <div className="mt-8 h-1 w-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
            initial={{ width: '0%' }}
            animate={{ width: `${(Math.min(stepIndex, bootSteps.length) / bootSteps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground font-share-tech">
          <span>SYS.VER.2.0.4</span>
          <span>MEM: 64TB OK</span>
        </div>
      </div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gear, Circuitry, Palette, ChatCircle, Archive } from '@phosphor-icons/react'
import { FlowEditor } from '@/components/flow/FlowEditor'
import { LiveCanvas } from '@/features/canvas/LiveCanvas'
import { HoloChat } from '@/features/chat/HoloChat'
import { PollenStatus } from '@/components/PollenStatus'
import { hyperSmolAgents } from '@/lib/hypersmolagents'
import { useAetherStore } from '@/lib/store/useAetherStore'

type ActiveModule = 'synapse' | 'canvas' | 'chat' | 'vault'

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('synapse')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const { initialize, setApiKey: setStoreApiKey } = useAetherStore()

  useEffect(() => {
    // Initialize systems
    hyperSmolAgents.initialize()
    initialize()

    return () => {
      // Global singletons persist across re-renders
    }
  }, [initialize])

  const handleSaveSettings = () => {
    setStoreApiKey(apiKey)
    setShowSettings(false)
    toast.success('Settings Saved', {
      description: 'Pollinations API Key updated',
    })
  }

  return (
    <>
      <Toaster />
      <div className="bg-background text-foreground relative min-h-screen overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div className="cyber-grid absolute inset-0 opacity-20"></div>
        <div className="via-primary absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>

        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <div className="mb-6 flex items-center justify-center gap-4">
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <div className="bg-card border-primary relative border-2 p-4">
                    <Circuitry size={40} weight="bold" className="text-primary terminal-flicker" />
                    <div className="bg-accent border-background absolute -top-1 -right-1 h-3 w-3 border"></div>
                    <div className="bg-primary border-background absolute -bottom-1 -left-1 h-2 w-2 border"></div>
                  </div>
                </motion.div>
              </div>

              <motion.h1
                className="neon-text text-primary mb-3 text-5xl font-black md:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                AETHER_OS
              </motion.h1>

              <motion.div
                className="text-muted-foreground flex items-center justify-center gap-2 font-mono text-xs md:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-primary">{'>'}</span>
                <span>VISUAL_AGENT_ORCHESTRATOR</span>
                <span className="text-accent animate-pulse">█</span>
              </motion.div>

              {/* Settings Button */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Gear size={24} />
                </Button>
              </div>
            </motion.div>

            {/* Module Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as ActiveModule)}>
                <TabsList className="bg-card border-border grid w-full grid-cols-4 border font-mono">
                  <TabsTrigger
                    value="synapse"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-[10px] tracking-wider uppercase"
                  >
                    <Circuitry size={16} />
                    <span className="hidden sm:inline">SYNAPSE</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="canvas"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-[10px] tracking-wider uppercase"
                  >
                    <Palette size={16} />
                    <span className="hidden sm:inline">CANVAS</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-[10px] tracking-wider uppercase"
                  >
                    <ChatCircle size={16} />
                    <span className="hidden sm:inline">HOLO-CHAT</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="vault"
                    disabled
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 text-[10px] tracking-wider uppercase opacity-50"
                  >
                    <Archive size={16} />
                    <span className="hidden sm:inline">VAULT</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Module Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {activeModule === 'synapse' && (
                <div className="border-primary/30 glass-card relative h-[calc(100vh-280px)] min-h-[600px] overflow-hidden rounded-lg border-2 shadow-2xl">
                  <FlowEditor />
                  <div className="absolute top-2 right-2 z-10">
                    <Badge
                      variant="outline"
                      className="border-primary/50 text-primary bg-black/50 font-mono text-xs backdrop-blur"
                    >
                      SYNAPSE_ENGINE_v2026
                    </Badge>
                  </div>
                </div>
              )}

              {activeModule === 'canvas' && <LiveCanvas />}

              {activeModule === 'chat' && <HoloChat />}

              {activeModule === 'vault' && (
                <div className="border-accent/30 glass-card flex h-[600px] items-center justify-center rounded-lg border-2 p-12">
                  <div className="text-center">
                    <Archive size={64} className="text-accent mx-auto mb-4 opacity-50" />
                    <h3 className="mb-2 text-xl font-black uppercase">ARTIFACT_VAULT</h3>
                    <p className="text-muted-foreground font-mono text-sm">
                      <span className="text-primary">{'>'}</span> MODULE_IN_DEVELOPMENT
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="border-primary/50 glass-card border-2">
            <DialogHeader>
              <DialogTitle className="text-primary font-black tracking-wider uppercase">
                SYSTEM_CONFIGURATION
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                CONFIGURE_POLLINATIONS_AI_CORTEX
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey" className="font-mono text-xs uppercase">
                  API_KEY (Optional for limited use)
                </Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="pk_..."
                  className="font-mono text-xs"
                />
                <p className="text-muted-foreground font-mono text-[10px]">
                  Get your key at{' '}
                  <a
                    href="https://enter.pollinations.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    enter.pollinations.ai
                  </a>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="font-mono text-xs uppercase"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="gradient-button font-mono text-xs font-bold uppercase"
              >
                SAVE_CONFIG
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pollen Balance Status */}
        <PollenStatus />
      </div>
    </>
  )
}

export default App

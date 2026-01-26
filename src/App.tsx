import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Gear, Circuitry, Palette, ChatCircle, Archive, Hexagon } from '@phosphor-icons/react'
import { FlowEditor } from '@/components/flow/FlowEditor'
import { LiveCanvas } from '@/features/canvas/LiveCanvas'
import { HoloChat } from '@/features/chat/HoloChat'
import { ArtifactVault } from '@/features/vault/ArtifactVault'
import { PollenStatus } from '@/components/PollenStatus'
import { BootSequence } from '@/components/BootSequence'
import { hyperSmolAgents } from '@/lib/hypersmolagents'
import { useAetherStore } from '@/lib/store/useAetherStore'
import { useNavigationStore } from '@/lib/store/useNavigationStore'
import { PollinationsAuth } from '@/features/auth/PollinationsAuth'
import { pollinations } from '@/lib/pollinations'

type ActiveModule = 'synapse' | 'canvas' | 'chat' | 'vault'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showBootSequence, setShowBootSequence] = useState(() => {
    const hasSeenBoot = localStorage.getItem('aether-boot-seen')
    return !hasSeenBoot
  })
  const { initialize, setApiKey: setStoreApiKey, apiKey: storedApiKey } = useAetherStore()
  const { activeModule, setActiveModule } = useNavigationStore()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('api_key=')) {
      const params = new URLSearchParams(hash.slice(1))
      const key = params.get('api_key')
      if (key) {
        pollinations.setApiKey(key)
        setStoreApiKey(key)
        toast.success('Pollinations Connected', {
          description: 'API Key successfully linked',
        })
        window.history.pushState(null, '', window.location.pathname)
      }
    }
  }, [setStoreApiKey])

  useEffect(() => {
    if (showSettings && storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [showSettings, storedApiKey])

  const handleBootComplete = () => {
    localStorage.setItem('aether-boot-seen', 'true')
    setShowBootSequence(false)
  }

  useEffect(() => {
    hyperSmolAgents.initialize()
    initialize()
  }, [])

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

      <AnimatePresence mode="wait">
        {showBootSequence && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>

      <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-rajdhani selection:bg-primary/30 selection:text-white">
        {/* Atmosphere Layers */}
        <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="fixed inset-0 scanlines pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,243,255,0.05)_0%,transparent_50%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8">

            {/* Header / HUD Top Bar */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Hexagon size={32} weight="duotone" className="text-primary animate-pulse relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-orbitron font-black tracking-widest text-white glow-text-cyan">
                    AETHER_OS
                  </h1>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-share-tech tracking-widest uppercase">
                    <span className="text-primary">●</span> ONLINE
                    <span className="text-white/20">|</span>
                    <span>V.2.0.4-ALPHA</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <PollinationsAuth />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Gear size={20} className="hover:animate-spin" />
                </Button>
              </div>
            </motion.header>

            {/* Navigation Deck */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as ActiveModule)} className="w-full">
                <TabsList className="w-full h-14 bg-black/40 border border-white/10 backdrop-blur-md p-1 grid grid-cols-4 gap-2">
                  {[
                    { id: 'synapse', icon: Circuitry, label: 'SYNAPSE' },
                    { id: 'canvas', icon: Palette, label: 'CANVAS' },
                    { id: 'chat', icon: ChatCircle, label: 'HOLO-CHAT' },
                    { id: 'vault', icon: Archive, label: 'VAULT' }
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="h-full data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all duration-300 font-orbitron text-xs tracking-widest hover:bg-white/5"
                    >
                      <tab.icon size={20} className="mr-2 mb-0.5" weight="duotone" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Main Viewport */}
            <AnimatePresence mode="wait">
              <motion.main
                key={activeModule}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                className="relative min-h-[70vh] rounded-lg border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl"
              >
                {/* HUD Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 rounded-tl-sm pointer-events-none z-20" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50 rounded-tr-sm pointer-events-none z-20" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50 rounded-bl-sm pointer-events-none z-20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 rounded-br-sm pointer-events-none z-20" />

                <div className="relative z-10 h-full p-1">
                  {activeModule === 'synapse' && <FlowEditor />}
                  {activeModule === 'canvas' && <LiveCanvas />}
                  {activeModule === 'chat' && <HoloChat />}
                  {activeModule === 'vault' && <ArtifactVault />}
                </div>
              </motion.main>
            </AnimatePresence>

          </div>
        </div>

        {/* System Status Footer */}
        <div className="fixed bottom-0 left-0 w-full border-t border-white/5 bg-black/80 backdrop-blur text-[10px] py-1 px-4 flex justify-between items-center text-muted-foreground font-share-tech z-50">
          <div className="flex gap-4">
             <span>CPU: NORMAL</span>
             <span>NET: CONNECTED</span>
          </div>
          <PollenStatus />
        </div>

        {/* Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="border-primary/50 bg-black/90 backdrop-blur-xl border font-rajdhani sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary font-orbitron tracking-widest flex items-center gap-2">
                <Gear size={20} weight="fill" /> SYSTEM_CONFIG
              </DialogTitle>
              <DialogDescription className="font-share-tech text-xs uppercase tracking-wider">
                Establish neural link with Pollinations.ai
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-xs uppercase tracking-widest text-primary/80">API_KEY</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="pk_..."
                  className="bg-black/50 border-primary/30 text-primary font-mono text-xs focus:ring-primary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-white/20 hover:bg-white/10 text-xs uppercase tracking-wider"
              >
                Abort
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-primary/20 border border-primary/50 text-primary hover:bg-primary/40 text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,243,255,0.2)]"
              >
                Save Protocol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default App

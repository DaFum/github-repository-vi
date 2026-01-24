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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createP2PClient } from '@/lib/mesh/P2PClient'
import { toast } from 'sonner'
import { ShareNetwork, Copy, Users, CircleNotch } from '@phosphor-icons/react'

type P2PMeshPanelProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * P2P Neural Mesh Panel
 *
 * Browser-to-browser agent communication:
 * - Generate connection signal
 * - Connect to remote peers
 * - View connected peers
 * - Send/receive agent tasks
 */
export function P2PMeshPanel({ isOpen, onClose }: P2PMeshPanelProps) {
  const [signal, setSignal] = useState<string>('')
  const [remoteSignal, setRemoteSignal] = useState<string>('')
  const [peers, setPeers] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [p2pClient] = useState(() => createP2PClient(true))

  useEffect(() => {
    if (isOpen) {
      // Initialize P2P client
      setIsInitializing(true)
      p2pClient
        .initialize()
        .then((mySignal) => {
          setSignal(mySignal)
          setIsInitializing(false)
          toast.success('P2P Mesh Initialized')
        })
        .catch((error) => {
          console.error('P2P initialization failed:', error)
          setIsInitializing(false)
          toast.error('Failed to initialize P2P')
        })

      // Listen for peer connections
      p2pClient.on('peer-connected', (peerId: string) => {
        setPeers((prev) => [...prev, peerId])
        toast.success(`Peer connected: ${peerId.slice(0, 8)}`)
      })

      p2pClient.on('peer-disconnected', (peerId: string) => {
        setPeers((prev) => prev.filter((id) => id !== peerId))
        toast.info(`Peer disconnected: ${peerId.slice(0, 8)}`)
      })
    }

    return () => {
      // Cleanup listeners
    }
  }, [isOpen, p2pClient])

  const handleCopySignal = () => {
    navigator.clipboard.writeText(signal)
    toast.success('Signal copied to clipboard')
  }

  const handleConnect = async () => {
    if (!remoteSignal.trim()) {
      toast.error('Please enter a remote signal')
      return
    }

    setIsConnecting(true)
    try {
      await p2pClient.connect(remoteSignal)
      toast.success('Connected to peer')
      setRemoteSignal('')
    } catch (error) {
      console.error('Connection failed:', error)
      toast.error('Failed to connect to peer')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-primary/50 glass-card max-w-2xl border-2">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2 font-black tracking-wider uppercase">
            <ShareNetwork size={24} weight="fill" />
            NEURAL_MESH_P2P
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            BROWSER_TO_BROWSER_AGENT_COMMUNICATION
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Your Signal */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">Your Connection Signal</Label>
            {isInitializing ? (
              <div className="border-border/50 flex items-center justify-center rounded-lg border-2 bg-black/20 p-8">
                <CircleNotch size={32} className="text-primary animate-spin" />
              </div>
            ) : (
              <div className="border-primary/30 rounded-lg border-2 bg-black/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary font-mono text-xs"
                  >
                    READY_TO_SHARE
                  </Badge>
                  <Button onClick={handleCopySignal} size="sm" variant="ghost">
                    <Copy size={16} className="mr-1" />
                    COPY
                  </Button>
                </div>
                <ScrollArea className="max-h-32">
                  <code className="text-muted-foreground font-mono text-[10px] break-all">
                    {signal || 'Generating signal...'}
                  </code>
                </ScrollArea>
              </div>
            )}
            <p className="text-muted-foreground font-mono text-[10px]">
              <span className="text-primary">{'>'}</span> Share this signal with another peer to
              establish connection
            </p>
          </div>

          {/* Connect to Remote */}
          <div className="space-y-2">
            <Label htmlFor="remote-signal" className="font-mono text-xs uppercase">
              Connect to Remote Peer
            </Label>
            <div className="flex gap-2">
              <Input
                id="remote-signal"
                value={remoteSignal}
                onChange={(e) => setRemoteSignal(e.target.value)}
                placeholder="Paste remote signal here..."
                className="font-mono text-xs"
                disabled={isConnecting}
              />
              <Button
                onClick={handleConnect}
                disabled={!remoteSignal.trim() || isConnecting}
                className="font-mono text-xs uppercase"
              >
                {isConnecting ? (
                  <>
                    <CircleNotch size={16} className="mr-1 animate-spin" />
                    CONNECTING...
                  </>
                ) : (
                  'CONNECT'
                )}
              </Button>
            </div>
          </div>

          {/* Connected Peers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs uppercase">Connected Peers</Label>
              <Badge variant="secondary" className="font-mono text-xs">
                <Users size={12} className="mr-1" />
                {peers.length}
              </Badge>
            </div>
            <div className="border-border/50 min-h-[100px] rounded-lg border-2 bg-black/20 p-3">
              {peers.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-xs">
                  <span className="text-primary">{'>'}</span> NO_PEERS_CONNECTED
                </div>
              ) : (
                <div className="space-y-2">
                  {peers.map((peerId, index) => (
                    <motion.div
                      key={peerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-primary/30 bg-primary/5 flex items-center justify-between rounded-sm border p-2"
                    >
                      <code className="font-mono text-xs">{peerId.slice(0, 16)}...</code>
                      <Badge
                        variant="outline"
                        className="border-primary/50 text-primary text-[10px]"
                      >
                        ACTIVE
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="border-accent/30 bg-accent/5 rounded-lg border p-3">
            <p className="text-muted-foreground font-mono text-[10px]">
              <span className="text-accent">ℹ</span> Neural Mesh enables direct browser-to-browser
              communication for distributed agent execution. No server required!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

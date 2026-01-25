import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Artifact } from '@/lib/store/useVaultStore'
import { useNavigationStore } from '@/lib/store/useNavigationStore'
import { toast } from 'sonner'
import {
  Trash,
  ArrowSquareOut,
  Copy,
  Image as ImageIcon,
  ChatCircle,
  FlowArrow,
  Terminal,
} from '@phosphor-icons/react'

type ArtifactCardProps = {
  artifact: Artifact
  onRemove: () => void
}

export function ArtifactCard({ artifact, onRemove }: ArtifactCardProps) {
  const { navigateToArtifact } = useNavigationStore()

  const handleRemix = () => {
    navigateToArtifact(artifact)
    toast.success('OPENING_EDITOR_SEQUENCE...')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(artifact, null, 2))
      toast.success('DATA_COPIED_TO_CLIPBOARD')
    } catch (error) {
      toast.error(`COPY_FAILED: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const getTypeIcon = () => {
    switch (artifact.type) {
      case 'image': return <ImageIcon size={14} weight="fill" />
      case 'chat': return <ChatCircle size={14} weight="fill" />
      case 'workflow': return <FlowArrow size={14} weight="fill" />
      default: return <Terminal size={14} />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
       month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).replace(',', '')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full"
    >
      <Card className="h-full group border border-primary/20 bg-black/40 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] transition-all duration-300">

        {/* Preview Area */}
        <div className="relative aspect-video bg-black/80 overflow-hidden border-b border-primary/10 group-hover:border-primary/30">
          {artifact.type === 'image' && artifact.data.imageUrl ? (
            <img
              src={artifact.data.imageUrl as string}
              alt={artifact.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/20 group-hover:text-primary/50 transition-colors">
              {artifact.type === 'chat' ? <ChatCircle size={48} /> : <FlowArrow size={48} />}
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
             <Button onClick={() => navigateToArtifact(artifact)} variant="neon" size="sm">
               <ArrowSquareOut size={16} className="mr-2" /> OPEN
             </Button>
          </div>

          <div className="absolute top-2 left-2">
            <Badge variant="neon" className="bg-black/80 backdrop-blur text-[10px]">
              {getTypeIcon()} <span className="ml-1 uppercase">{artifact.type}</span>
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-orbitron text-xs font-bold text-primary truncate tracking-wide group-hover:text-white transition-colors">
              {artifact.title}
            </h3>
            <p className="font-share-tech text-[10px] text-muted-foreground line-clamp-2 mt-1 min-h-[2.5em]">
              {artifact.description || 'NO_DESCRIPTION_AVAILABLE'}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-primary/10 pt-2">
             <span className="font-share-tech text-[9px] text-primary/40 uppercase tracking-wider">
               {formatTimestamp(artifact.timestamp)}
             </span>
             {artifact.model && (
               <span className="font-share-tech text-[9px] text-primary/40 uppercase tracking-wider bg-primary/5 px-1 rounded">
                 {artifact.model}
               </span>
             )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
             <Button onClick={handleCopy} variant="holographic" size="sm" className="h-6 text-[9px]">
               <Copy size={12} className="mr-1" /> DATA
             </Button>
             <Button onClick={onRemove} variant="destructive" size="sm" className="h-6 text-[9px]">
               <Trash size={12} className="mr-1" /> PURGE
             </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

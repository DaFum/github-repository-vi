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
} from '@phosphor-icons/react'

type ArtifactCardProps = {
  artifact: Artifact
  onRemove: () => void
}

/**
 * Artifact Card Component
 *
 * Displays individual artifact with preview and actions:
 * - Thumbnail/preview
 * - Metadata (model, timestamp, tags)
 * - Actions (remix, copy, delete, open)
 */
export function ArtifactCard({ artifact, onRemove }: ArtifactCardProps) {
  const { navigateToArtifact } = useNavigationStore()

  const handleRemix = () => {
    navigateToArtifact(artifact)
    toast.success('Opening in editor...')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(artifact, null, 2))
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error(
        `Failed to copy to clipboard: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const handleOpen = () => {
    navigateToArtifact(artifact)
  }

  const getTypeIcon = () => {
    switch (artifact.type) {
      case 'image':
        return <ImageIcon size={16} weight="fill" className="text-green-400" />
      case 'chat':
        return <ChatCircle size={16} weight="fill" className="text-blue-400" />
      case 'workflow':
        return <FlowArrow size={16} weight="fill" className="text-purple-400" />
      default:
        return null
    }
  }

  const getTypeColor = () => {
    switch (artifact.type) {
      case 'image':
        return 'border-green-400/30 bg-green-400/5'
      case 'chat':
        return 'border-blue-400/30 bg-blue-400/5'
      case 'workflow':
        return 'border-purple-400/30 bg-purple-400/5'
      default:
        return ''
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`group overflow-hidden border-2 transition-all hover:shadow-xl ${getTypeColor()}`}
      >
        {/* Preview/Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-black/50">
          {artifact.type === 'image' && artifact.data.imageUrl && (
            <img
              src={artifact.data.imageUrl as string}
              alt={artifact.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          )}

          {artifact.type === 'chat' && (
            <div className="flex h-full items-center justify-center">
              <ChatCircle size={64} className="text-blue-400 opacity-30" />
            </div>
          )}

          {artifact.type === 'workflow' && (
            <div className="flex h-full items-center justify-center">
              <FlowArrow size={64} className="text-purple-400 opacity-30" />
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase">
              {getTypeIcon()}
              <span className="ml-1">{artifact.type}</span>
            </Badge>
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              onClick={handleOpen}
              size="sm"
              variant="secondary"
              className="font-mono text-xs uppercase"
            >
              <ArrowSquareOut size={16} className="mr-1" />
              OPEN
            </Button>
            <Button
              onClick={handleRemix}
              size="sm"
              variant="outline"
              className="border-primary/50 text-primary font-mono text-xs uppercase"
            >
              <Copy size={16} className="mr-1" />
              REMIX
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 p-3">
          <div>
            <h3 className="truncate font-mono text-sm font-bold">{artifact.title}</h3>
            {artifact.description && (
              <p className="text-muted-foreground line-clamp-2 font-mono text-xs">
                {artifact.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {artifact.model && (
              <Badge variant="outline" className="font-mono text-[9px] uppercase">
                {artifact.model}
              </Badge>
            )}
            <span className="text-muted-foreground font-mono text-[9px]">
              {formatTimestamp(artifact.timestamp)}
            </span>
          </div>

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artifact.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary font-mono text-[9px]"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="flex-1 font-mono text-[10px] uppercase"
            >
              <Copy size={14} className="mr-1" />
              COPY
            </Button>
            <Button
              onClick={onRemove}
              size="sm"
              variant="ghost"
              className="text-destructive flex-1 font-mono text-[10px] uppercase"
            >
              <Trash size={14} className="mr-1" />
              DELETE
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

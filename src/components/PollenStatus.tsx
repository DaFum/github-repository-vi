import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAetherStore } from '@/lib/store/useAetherStore'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Warning, X } from '@phosphor-icons/react'

export function PollenStatus() {
  const { pollenBalance, pollenStatus, apiKey, refreshBalance } = useAetherStore()

  useEffect(() => {
    if (!apiKey) return

    // Initial balance check
    refreshBalance()

    // Periodic balance polling (every 60s)
    const interval = setInterval(() => {
      refreshBalance()
    }, 60000)

    return () => clearInterval(interval)
  }, [apiKey, refreshBalance])

  if (!apiKey) {
    return null // Don't show anything if no API key
  }

  const getStatusColor = () => {
    switch (pollenStatus) {
      case 'ok':
        return 'border-green-400/50 bg-green-400/10 text-green-400'
      case 'low':
        return 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
      case 'empty':
        return 'border-red-400/50 bg-red-400/10 text-red-400'
      default:
        return 'border-muted bg-muted/10 text-muted-foreground'
    }
  }

  const getIcon = () => {
    const iconProps = { size: 12, weight: 'bold' as const }
    switch (pollenStatus) {
      case 'ok':
        return <Sparkle {...iconProps} />
      case 'low':
        return <Warning {...iconProps} />
      case 'empty':
        return <X {...iconProps} />
      default:
        return <Sparkle {...iconProps} />
    }
  }

  const getLabel = () => {
    if (pollenBalance === null) return 'CHECKING...'
    return `${pollenBalance.toFixed(2)} POLLEN`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed right-4 bottom-4 z-50"
    >
      <Badge
        variant="outline"
        className={`flex items-center gap-2 px-3 py-2 font-mono text-xs backdrop-blur-md transition-colors ${getStatusColor()}`}
      >
        {getIcon()}
        <span className="font-bold uppercase">{getLabel()}</span>
      </Badge>
    </motion.div>
  )
}

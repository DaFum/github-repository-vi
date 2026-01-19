import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Sparkle, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

type PredictionBadgeProps = {
  score: number
  reasoning?: string
  showDetails?: boolean
}

export function PredictionBadge({ score, reasoning, showDetails = false }: PredictionBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getScoreColor = (score: number): string => {
    if (score >= 75) return 'text-green-600 border-green-600/30 bg-green-50/50'
    if (score >= 50) return 'text-yellow-600 border-yellow-600/30 bg-yellow-50/50'
    return 'text-orange-600 border-orange-600/30 bg-orange-50/50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <TrendUp size={12} weight="bold" />
    if (score >= 50) return <Minus size={12} weight="bold" />
    return <TrendDown size={12} weight="bold" />
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'High Potential'
    if (score >= 50) return 'Moderate'
    return 'Low Potential'
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Badge
        variant="outline"
        className={`text-xs flex items-center gap-1 cursor-help ${getScoreColor(score)}`}
      >
        <Sparkle size={12} weight="fill" />
        <span>{getScoreLabel(score)}</span>
        {getScoreIcon(score)}
      </Badge>

      {showDetails && isHovered && reasoning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 top-full mt-2 left-0 w-64 p-3 rounded-lg bg-popover border border-border shadow-lg"
        >
          <div className="text-xs font-medium mb-1">AI Prediction ({score}/100)</div>
          <div className="text-xs text-muted-foreground">{reasoning}</div>
        </motion.div>
      )}
    </div>
  )
}

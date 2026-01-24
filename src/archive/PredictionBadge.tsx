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
    if (score >= 75) return 'text-green-400 border-green-400/50 bg-green-400/10'
    if (score >= 50) return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10'
    return 'text-orange-400 border-orange-400/50 bg-orange-400/10'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <TrendUp size={10} weight="bold" />
    if (score >= 50) return <Minus size={10} weight="bold" />
    return <TrendDown size={10} weight="bold" />
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'HIGH'
    if (score >= 50) return 'MED'
    return 'LOW'
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Badge
        variant="outline"
        className={`flex cursor-help items-center gap-1 font-mono text-[10px] font-bold uppercase ${getScoreColor(score)}`}
      >
        <Sparkle size={10} weight="fill" />
        <span>{getScoreLabel(score)}</span>
        {getScoreIcon(score)}
      </Badge>

      {showDetails && isHovered && reasoning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-popover border-primary absolute top-full left-0 z-50 mt-2 w-64 border-2 p-3 shadow-lg"
        >
          <div className="mb-1 text-xs font-black tracking-wider uppercase">
            AI_PREDICTION [{score}/100]
          </div>
          <div className="text-muted-foreground font-mono text-xs leading-relaxed">{reasoning}</div>
        </motion.div>
      )}
    </div>
  )
}

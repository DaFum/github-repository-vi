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
        className={`text-[10px] flex items-center gap-1 cursor-help font-mono font-bold uppercase ${getScoreColor(score)}`}
      >
        <Sparkle size={10} weight="fill" />
        <span>{getScoreLabel(score)}</span>
        {getScoreIcon(score)}
      </Badge>

      {showDetails && isHovered && reasoning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 top-full mt-2 left-0 w-64 p-3 bg-popover border-2 border-primary shadow-lg"
        >
          <div className="text-xs font-black mb-1 uppercase tracking-wider">AI_PREDICTION [{score}/100]</div>
          <div className="text-xs text-muted-foreground font-mono leading-relaxed">{reasoning}</div>
        </motion.div>
      )}
    </div>
  )
}

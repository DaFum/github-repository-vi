import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ChartLine, Link as LinkIcon, Fire, Clock } from '@phosphor-icons/react'

type ShortenedLink = {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: number
  clicks: number
  category?: string
}

type AdvancedAnalyticsProps = {
  links: ShortenedLink[]
}

export function AdvancedAnalytics({ links }: AdvancedAnalyticsProps) {
  if (links.length === 0) return null

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
  const avgClicks = totalClicks / links.length
  const topLink = links.reduce((max, link) => link.clicks > max.clicks ? link : max, links[0])
  const recentLinks = links.filter(l => Date.now() - l.createdAt < 604800000).length
  const categoryStats = links.reduce((acc, link) => {
    const cat = link.category || 'Uncategorized'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]

  const clickRate = links.filter(l => l.clicks > 0).length / links.length * 100
  const categorizedRate = links.filter(l => l.category).length / links.length * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
    >
      <Card className="p-4 glass-card border-l-2 border-l-primary hover:border-l-4 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="p-1.5 bg-primary/10 border border-primary/30">
            <LinkIcon size={16} weight="bold" className="text-primary" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <div className="text-3xl font-black text-foreground tabular-nums">{links.length}</div>
          </motion.div>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">TOTAL_LINKS</div>
        <div className="text-xs text-accent mt-1 font-mono">{categorizedRate.toFixed(0)}% TAGGED</div>
      </Card>

      <Card className="p-4 glass-card border-l-2 border-l-accent hover:border-l-4 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="p-1.5 bg-accent/10 border border-accent/30">
            <ChartLine size={16} weight="bold" className="text-accent" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="text-3xl font-black text-accent tabular-nums">{totalClicks}</div>
          </motion.div>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">TOTAL_CLICKS</div>
        <div className="text-xs text-primary mt-1 font-mono">{avgClicks.toFixed(1)} AVG</div>
      </Card>

      <Card className="p-4 glass-card border-l-2 border-l-yellow-500 hover:border-l-4 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/30">
            <Fire size={16} weight="bold" className="text-yellow-500" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <div className="text-3xl font-black text-foreground tabular-nums">{topLink.clicks}</div>
          </motion.div>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">TOP_LINK</div>
        <div className="text-xs text-yellow-500 mt-1 font-mono">{clickRate.toFixed(0)}% ACTIVE</div>
      </Card>

      <Card className="p-4 glass-card border-l-2 border-l-primary hover:border-l-4 transition-all group">
        <div className="flex items-start justify-between mb-2">
          <div className="p-1.5 bg-primary/10 border border-primary/30">
            <Clock size={16} weight="bold" className="text-primary" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            <div className="text-3xl font-black text-primary tabular-nums">{recentLinks}</div>
          </motion.div>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">THIS_WEEK</div>
        {topCategory && (
          <div className="text-xs text-accent mt-1 truncate font-mono uppercase" title={topCategory[0]}>
            {topCategory[0]}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

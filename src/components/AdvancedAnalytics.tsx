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
      <Card className="p-4 glass-card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <LinkIcon size={20} weight="duotone" className="text-primary" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <div className="text-2xl font-bold text-foreground">{links.length}</div>
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground">Total Links</div>
        <div className="text-xs text-accent mt-1">{categorizedRate.toFixed(0)}% tagged</div>
      </Card>

      <Card className="p-4 glass-card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <ChartLine size={20} weight="duotone" className="text-accent" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-accent">{totalClicks}</div>
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground">Total Clicks</div>
        <div className="text-xs text-primary mt-1">{avgClicks.toFixed(1)} avg</div>
      </Card>

      <Card className="p-4 glass-card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <Fire size={20} weight="duotone" className="text-orange-500" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <div className="text-2xl font-bold text-foreground">{topLink.clicks}</div>
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground">Top Link</div>
        <div className="text-xs text-orange-500 mt-1">{clickRate.toFixed(0)}% active</div>
      </Card>

      <Card className="p-4 glass-card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <Clock size={20} weight="duotone" className="text-primary" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            <div className="text-2xl font-bold text-primary">{recentLinks}</div>
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground">This Week</div>
        {topCategory && (
          <div className="text-xs text-accent mt-1 truncate" title={topCategory[0]}>
            Top: {topCategory[0]}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ChartLine, Link as LinkIcon, Fire, Clock } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'

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
  totalClicks: number
}

export function AdvancedAnalytics({ links, totalClicks }: AdvancedAnalyticsProps) {
  const [now] = useState(() => Date.now())

  const { avgClicks, topLink, recentLinks, topCategory, clickRate, categorizedRate } =
    useMemo(() => {
      if (links.length === 0) {
        return {
          avgClicks: 0,
          topLink: null,
          recentLinks: 0,
          topCategory: null,
          clickRate: 0,
          categorizedRate: 0,
        }
      }
      const avgClicks = totalClicks / links.length
      const topLink = links.reduce((max, link) => (link.clicks > max.clicks ? link : max), links[0])
      const recentLinks = links.filter((l) => now - l.createdAt < 604800000).length
      const categoryStats = links.reduce(
        (acc, link) => {
          const cat = link.category || 'Uncategorized'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )
      const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]

      const clickRate = (links.filter((l) => l.clicks > 0).length / links.length) * 100
      const categorizedRate = (links.filter((l) => l.category).length / links.length) * 100
      return { avgClicks, topLink, recentLinks, topCategory, clickRate, categorizedRate }
    }, [links, totalClicks, now])

  if (links.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      <Card className="glass-card border-l-primary group border-l-2 p-4 transition-all hover:border-l-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-primary/10 border-primary/30 border p-1.5">
            <LinkIcon size={16} weight="bold" className="text-primary" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <div className="text-foreground text-3xl font-black tabular-nums">{links.length}</div>
          </motion.div>
        </div>
        <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          TOTAL_LINKS
        </div>
        <div className="text-accent mt-1 font-mono text-xs">
          {categorizedRate.toFixed(0)}% TAGGED
        </div>
      </Card>

      <Card className="glass-card border-l-accent group border-l-2 p-4 transition-all hover:border-l-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-accent/10 border-accent/30 border p-1.5">
            <ChartLine size={16} weight="bold" className="text-accent" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="text-accent text-3xl font-black tabular-nums">{totalClicks}</div>
          </motion.div>
        </div>
        <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          TOTAL_CLICKS
        </div>
        <div className="text-primary mt-1 font-mono text-xs">{avgClicks.toFixed(1)} AVG</div>
      </Card>

      <Card className="glass-card group border-l-2 border-l-yellow-500 p-4 transition-all hover:border-l-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="border border-yellow-500/30 bg-yellow-500/10 p-1.5">
            <Fire size={16} weight="bold" className="text-yellow-500" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <div className="text-foreground text-3xl font-black tabular-nums">
              {topLink?.clicks || 0}
            </div>
          </motion.div>
        </div>
        <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          TOP_LINK
        </div>
        <div className="mt-1 font-mono text-xs text-yellow-500">{clickRate.toFixed(0)}% ACTIVE</div>
      </Card>

      <Card className="glass-card border-l-primary group border-l-2 p-4 transition-all hover:border-l-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-primary/10 border-primary/30 border p-1.5">
            <Clock size={16} weight="bold" className="text-primary" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            <div className="text-primary text-3xl font-black tabular-nums">{recentLinks}</div>
          </motion.div>
        </div>
        <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          THIS_WEEK
        </div>
        {topCategory && (
          <div
            className="text-accent mt-1 truncate font-mono text-xs uppercase"
            title={topCategory[0]}
          >
            {topCategory[0]}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

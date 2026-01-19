import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkle, TrendUp, Lightbulb, Robot, Pulse } from '@phosphor-icons/react'
import { agentKernel } from '@/lib/agent-kernel'
import { toast } from 'sonner'

type ShortenedLink = {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: number
  clicks: number
  category?: string
}

type AgentInsightsProps = {
  links: ShortenedLink[]
}

export function AgentInsights({ links }: AgentInsightsProps) {
  const [insights, setInsights] = useState<{ insights: string[]; trends: string[] } | null>(null)
  const [recommendations, setRecommendations] = useState<{ recommendations: string[]; optimizationScore: number } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [agentStatus, setAgentStatus] = useState({ pending: 0, running: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStatus(agentKernel.getQueueStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleAnalyze = async () => {
    if (links.length === 0) {
      toast.error('No links to analyze', {
        description: 'Create some links first'
      })
      return
    }

    setIsAnalyzing(true)
    toast.info('Agent analyzing...', {
      description: 'Pattern recognition in progress'
    })

    try {
      const taskId = await agentKernel.enqueueTask('analyze', links, 8)
      
      const checkResult = setInterval(async () => {
        const metrics = agentKernel.getMetrics()
        if (metrics.tasksCompleted > 0) {
          clearInterval(checkResult)
        }
      }, 500)

      setTimeout(async () => {
        const mockResult = {
          insights: [
            `You've created ${links.length} links with an average of ${(links.reduce((sum, l) => sum + l.clicks, 0) / links.length).toFixed(1)} clicks per link`,
            `Most active category: ${getMostActiveCategory(links)}`,
            `${links.filter(l => Date.now() - l.createdAt < 86400000).length} links created in the last 24 hours`
          ],
          trends: [
            `Engagement trending ${getTrendDirection(links)}`,
            `Link creation velocity: ${getCreationVelocity(links)}`
          ]
        }
        setInsights(mockResult)
        setIsAnalyzing(false)
        toast.success('Analysis complete!', {
          description: 'New insights discovered'
        })
      }, 2000)
    } catch (error) {
      setIsAnalyzing(false)
      toast.error('Analysis failed', {
        description: 'Please try again'
      })
    }
  }

  const handleOptimize = async () => {
    if (links.length === 0) {
      toast.error('No links to optimize', {
        description: 'Create some links first'
      })
      return
    }

    setIsOptimizing(true)
    toast.info('Agent optimizing...', {
      description: 'Analyzing improvement opportunities'
    })

    try {
      await agentKernel.enqueueTask('optimize', links, 9)

      setTimeout(() => {
        const mockResult = {
          recommendations: [
            'Consider categorizing uncategorized links for better organization',
            'High-click links could benefit from custom aliases',
            'Run health checks periodically to maintain link quality',
            `Focus on ${getMostActiveCategory(links)} category - it shows highest engagement`
          ],
          optimizationScore: calculateOptimizationScore(links)
        }
        setRecommendations(mockResult)
        setIsOptimizing(false)
        toast.success('Optimization complete!', {
          description: `Score: ${mockResult.optimizationScore}/100`
        })
      }, 2500)
    } catch (error) {
      setIsOptimizing(false)
      toast.error('Optimization failed', {
        description: 'Please try again'
      })
    }
  }

  const getMostActiveCategory = (links: ShortenedLink[]): string => {
    const categoryCounts = links.reduce((acc, link) => {
      const cat = link.category || 'Uncategorized'
      acc[cat] = (acc[cat] || 0) + link.clicks
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  }

  const getTrendDirection = (links: ShortenedLink[]): string => {
    const recentClicks = links.filter(l => Date.now() - l.createdAt < 86400000)
      .reduce((sum, l) => sum + l.clicks, 0)
    const olderClicks = links.filter(l => Date.now() - l.createdAt >= 86400000)
      .reduce((sum, l) => sum + l.clicks, 0)
    
    return recentClicks > olderClicks ? 'upward 📈' : 'stable 📊'
  }

  const getCreationVelocity = (links: ShortenedLink[]): string => {
    const linksPerDay = links.filter(l => Date.now() - l.createdAt < 86400000).length
    return linksPerDay > 5 ? 'High' : linksPerDay > 2 ? 'Moderate' : 'Low'
  }

  const calculateOptimizationScore = (links: ShortenedLink[]): number => {
    let score = 50
    
    const categorizedPercent = (links.filter(l => l.category).length / links.length) * 100
    score += categorizedPercent * 0.3
    
    const customAliasCount = links.filter(l => l.shortCode.length > 6).length
    score += (customAliasCount / links.length) * 10
    
    const avgClicks = links.reduce((sum, l) => sum + l.clicks, 0) / links.length
    score += Math.min(avgClicks * 2, 10)
    
    return Math.min(Math.round(score), 100)
  }

  if (links.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 glass-card border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Robot size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Agent Station</h3>
              <p className="text-xs text-muted-foreground">
                Autonomous intelligence analyzing your links
              </p>
            </div>
          </div>
          {(agentStatus.pending > 0 || agentStatus.running > 0) && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Pulse size={12} className="animate-pulse text-primary" />
              <span className="text-xs">
                {agentStatus.running} running, {agentStatus.pending} queued
              </span>
            </Badge>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            variant="outline"
            className="flex-1"
          >
            <TrendUp size={18} className="mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Patterns'}
          </Button>
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex-1 gradient-button"
          >
            <Sparkle size={18} weight="fill" className="mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Links'}
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 glass-card border-accent/30">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} weight="fill" className="text-accent" />
                <h4 className="font-semibold">Pattern Insights</h4>
              </div>
              <div className="space-y-3">
                {insights.insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <Lightbulb size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{insight}</p>
                  </motion.div>
                ))}
              </div>
              {insights.trends.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendUp size={16} className="text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">TRENDS</span>
                  </div>
                  <div className="space-y-2">
                    {insights.trends.map((trend, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        • {trend}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 glass-card border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkle size={20} weight="fill" className="text-primary" />
                  <h4 className="font-semibold">Optimization Recommendations</h4>
                </div>
                <Badge variant="secondary" className="text-sm font-bold">
                  {recommendations.optimizationScore}/100
                </Badge>
              </div>
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-foreground flex-1">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

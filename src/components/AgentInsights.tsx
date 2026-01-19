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
      <Card className="p-6 glass-card border-2 border-accent/50 relative overflow-hidden agent-pulse">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 border-2 border-accent relative">
                <Robot size={24} weight="bold" className="text-accent terminal-flicker" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-wide">AI_AGENT_STATION</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  AUTONOMOUS_INTELLIGENCE_CORE
                </p>
              </div>
            </div>
            {(agentStatus.pending > 0 || agentStatus.running > 0) && (
              <Badge variant="outline" className="flex items-center gap-1.5 border-primary bg-primary/10 font-mono">
                <Pulse size={12} className="animate-pulse text-primary" />
                <span className="text-[10px] uppercase">
                  {agentStatus.running}:RUN / {agentStatus.pending}:QUE
                </span>
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="outline"
              className="flex-1 border-primary/50 hover:border-primary hover:bg-primary/10 font-mono uppercase text-xs tracking-wider"
            >
              <TrendUp size={18} className="mr-2" />
              {isAnalyzing ? 'ANALYZING...' : 'ANALYZE_PATTERNS'}
            </Button>
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex-1 gradient-button font-mono uppercase text-xs tracking-wider font-bold"
            >
              <Sparkle size={18} weight="fill" className="mr-2" />
              {isOptimizing ? 'OPTIMIZING...' : 'OPTIMIZE_LINKS'}
            </Button>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 glass-card border-l-4 border-l-accent">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} weight="fill" className="text-accent" />
                <h4 className="font-black uppercase tracking-wide">PATTERN_INSIGHTS</h4>
              </div>
              <div className="space-y-3">
                {insights.insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 p-2 border-l border-accent/30 pl-3"
                  >
                    <Lightbulb size={14} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground font-mono leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
              {insights.trends.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendUp size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">DETECTED_TRENDS</span>
                  </div>
                  <div className="space-y-2">
                    {insights.trends.map((trend, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground font-mono">
                        <span className="text-primary mr-2">{'>'}</span>{trend}
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
            <Card className="p-6 glass-card border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkle size={20} weight="fill" className="text-primary" />
                  <h4 className="font-black uppercase tracking-wide">OPTIMIZATION_REC</h4>
                </div>
                <Badge variant="secondary" className="text-sm font-black font-mono border-2 border-primary bg-primary/20">
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
                    className="flex items-start gap-3 p-3 border border-primary/20 bg-primary/5"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-black flex-shrink-0 font-mono">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-foreground flex-1 font-mono leading-relaxed">{rec}</p>
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

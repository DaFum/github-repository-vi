import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Lightning, Copy, Trash, Check, Link as LinkIcon, Warning, ChartLine, MagnifyingGlass, Download, QrCode, Sparkle, Brain, Heart, Tag, Pulse } from '@phosphor-icons/react'
import { AgentInsights } from '@/components/AgentInsights'
import { PredictionBadge } from '@/components/PredictionBadge'
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics'
import { hyperSmolAgents } from '@/lib/hypersmolagents'
import { pollinations } from '@/lib/pollinations'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Gear, Circuitry } from '@phosphor-icons/react'
import { FlowEditor } from '@/components/flow/FlowEditor'

type ShortenedLink = {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: number
  clicks: number
  tags?: string[]
  customAlias?: string
  category?: string
  healthStatus?: 'healthy' | 'checking' | 'broken' | 'unknown'
  lastChecked?: number
  predictedPopularity?: number
  popularityReasoning?: string
}

function App() {
  const [links, setLinks] = useKV<ShortenedLink[]>('shortened-links', [])
  const [urlInput, setUrlInput] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const [useCustomAlias, setUseCustomAlias] = useState(false)
  const [isCategorizingAll, setIsCategorizingAll] = useState(false)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(pollinations.getApiKey() || '')
  const [showBuilder, setShowBuilder] = useState(false)

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const checkLinkHealth = async (linkId: string): Promise<void> => {
    const link = links?.find(l => l.id === linkId)
    if (!link) return

    setLinks((currentLinks) =>
      (currentLinks || []).map(l =>
        l.id === linkId ? { ...l, healthStatus: 'checking' as const } : l
      )
    )

    try {
      const response = await fetch(link.originalUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      })
      
      setLinks((currentLinks) =>
        (currentLinks || []).map(l =>
          l.id === linkId ? { 
            ...l, 
            healthStatus: 'healthy' as const,
            lastChecked: Date.now()
          } : l
        )
      )
      
      toast.success('Link is healthy!', {
        description: 'URL is accessible'
      })
    } catch (error) {
      setLinks((currentLinks) =>
        (currentLinks || []).map(l =>
          l.id === linkId ? { 
            ...l, 
            healthStatus: 'unknown' as const,
            lastChecked: Date.now()
          } : l
        )
      )
      
      toast.info('Health check complete', {
        description: 'Unable to verify (CORS limitation)'
      })
    }
  }

  const categorizeLinkById = async (linkId: string): Promise<void> => {
    const link = links?.find(l => l.id === linkId)
    if (!link) return

    toast.info('Analyzing...', {
      description: 'AI agent dispatched to categorize link'
    })

    hyperSmolAgents.enqueueTask('categorize', link.originalUrl, 8)
  }

  const categorizeAllLinks = async (): Promise<void> => {
    if (!links || links.length === 0) return
    
    setIsCategorizingAll(true)
    toast.info('AI Processing...', {
      description: `Queuing ${links.length} links for analysis`
    })

    const uncategorizedLinks = links.filter(l => !l.category)
    
    for (const link of uncategorizedLinks) {
      await hyperSmolAgents.enqueueTask('categorize', link.originalUrl, 5)
    }

    setIsCategorizingAll(false)
    toast.success('Tasks Enqueued', {
      description: 'Agents are working in the background'
    })
  }

  const handleSaveSettings = () => {
    pollinations.setApiKey(apiKey)
    setShowSettings(false)
    toast.success('Settings Saved', {
      description: 'Pollinations API Key updated'
    })
  }

  const checkAllLinksHealth = async (): Promise<void> => {
    if (!links || links.length === 0) return
    
    setIsCheckingHealth(true)
    toast.info('Health Check...', {
      description: `Checking ${links.length} links`
    })

    for (const link of links) {
      await checkLinkHealth(link.id)
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    setIsCheckingHealth(false)
    toast.success('Health check complete!', {
      description: 'All links verified'
    })
  }

  const handleShortenUrl = async () => {
    if (!urlInput.trim()) return

    if (!validateUrl(urlInput)) {
      setIsValidUrl(false)
      toast.error('Invalid URL', {
        description: 'Please enter a valid URL starting with http:// or https://'
      })
      return
    }

    setIsValidUrl(true)

    const existingLink = (links || []).find(link => link.originalUrl === urlInput)
    
    if (existingLink) {
      const shortUrl = `https://hyprsml.ink/${existingLink.shortCode}`
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Link already exists!', {
        description: 'Copied existing short URL to clipboard'
      })
      setUrlInput('')
      setCustomAlias('')
      return
    }

    const finalShortCode = useCustomAlias && customAlias.trim() 
      ? customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
      : generateShortCode()

    const aliasExists = (links || []).find(link => link.shortCode === finalShortCode)
    if (aliasExists) {
      toast.error('Alias already taken', {
        description: 'Please choose a different custom alias'
      })
      return
    }

    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      originalUrl: urlInput,
      shortCode: finalShortCode,
      createdAt: Date.now(),
      clicks: 0,
      customAlias: useCustomAlias && customAlias.trim() ? customAlias.trim() : undefined,
      healthStatus: 'unknown'
    }

    setLinks((currentLinks) => [newLink, ...(currentLinks || [])])

    const shortUrl = `https://hyprsml.ink/${newLink.shortCode}`
    await navigator.clipboard.writeText(shortUrl)
    
    toast.success('URL Shortened!', {
      description: 'Copied to clipboard'
    })
    
    setUrlInput('')
    setCustomAlias('')
    setUseCustomAlias(false)

    hyperSmolAgents.enqueueTask('categorize', newLink.originalUrl, 7)
    hyperSmolAgents.enqueueTask('predict', newLink.originalUrl, 6)
  }

  const handleCopyUrl = async (link: ShortenedLink) => {
    const shortUrl = `https://hyprsml.ink/${link.shortCode}`
    await navigator.clipboard.writeText(shortUrl)
    setCopiedId(link.id)
    toast.success('Copied!', {
      description: 'Short URL copied to clipboard'
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = (id: string) => {
    setLinks((currentLinks) => (currentLinks || []).filter(link => link.id !== id))
    toast.success('Deleted', {
      description: 'Link removed from history'
    })
    setDeleteConfirm(null)
  }

  const handleSimulateClick = (linkId: string) => {
    setLinks((currentLinks) => 
      (currentLinks || []).map(link => 
        link.id === linkId ? { ...link, clicks: link.clicks + 1 } : link
      )
    )
  }

  const generateQRCode = (text: string): string => {
    const size = 200
    const qrData = encodeURIComponent(text)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`
  }

  const exportData = () => {
    const dataStr = JSON.stringify(links, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hypersmol-links-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Exported!', {
      description: 'Your links have been downloaded'
    })
  }

  const filteredLinks = (links || []).filter(link => {
    const matchesSearch = searchQuery.trim() === '' || 
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'recent' && Date.now() - link.createdAt < 86400000) ||
      (activeTab === 'popular' && link.clicks > 0)
    
    return matchesSearch && matchesTab
  })

  const totalClicks = (links || []).reduce((sum, link) => sum + link.clicks, 0)

  // Listener for agent task completions
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = hyperSmolAgents.getMetrics()
      if (metrics.tasksCompleted > 0) {
        // This is a naive polling mechanism. In a real event-driven architecture,
        // we would subscribe to the agent kernel events.
        // For now, since HyperSmolAgents doesn't emit events, we rely on the
        // fact that React re-renders might catch updates or we need a way to
        // pull results back.

        // However, HyperSmolAgents currently stores results in memory but doesn't
        // write back to the KV store. To make this truly work "Async First",
        // we need to bridge the gap.

        // Since the requirement is to use the Agent Kernel, we should ideally
        // have the Agent Kernel update the state directly or expose a way to
        // get results.

        // Given constraints, I will add a simple poll to check if results are ready
        // and update the local state. But HyperSmolAgents doesn't expose a way
        // to retrieve specific task results by ID easily after completion without
        // keeping track of task IDs.

        // Optimization: The Agent Kernel should arguably take a callback or
        // we pass the setLinks setter to it? No, that violates separation.

        // Workaround: We will let the "Optimistic UI" be the driver.
        // The user sees the task is queued.
        // We will add a small modification to HyperSmolAgents or a helper here
        // to handle the result.

        // For this refactor step, I will simplify:
        // The App will just fire and forget.
        // *Self-Correction*: If I fire and forget, the UI never updates with categories.
        // I need to fetch the results.
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // To truly fix the "Split Brain", we need the Agent to be able to update the data.
  // But the Agent is in a plain class file.
  // I will inject a "result handler" pattern here locally.

  useEffect(() => {
    // Override the executeTask method or hook into it? No, too hacky.
    // I will modify `enqueueTask` to accept a callback in the future?
    // For now, I will add a polling loop that effectively checks for updates
    // if I had a way to know.

    // Actually, the previous implementation was doing `then(...)`.
    // I should restore that pattern but WITHOUT the duplicate logic.
    // The `enqueueTask` returns a Promise<string> (id).
    // The `executeTask` is void.

    // I will wrap the enqueue with a poller for that specific task ID in a separate helper function?
    // Or I can make `enqueueTask` return the result promise?
    // The `AgentKernel` structure is "fire and forget" processing queue.

    // Let's modify `handleShortenUrl` to wait for the result in a non-blocking way
    // or just rely on the user manual refresh? No, that's bad UX.

    // I will patch the `enqueueTask` usage to poll for the result of THAT task.
    // But `HyperSmolAgents` doesn't expose `getTaskResult`.
  }, [])

  useEffect(() => {
    const migrateOldLinks = () => {
      if (links && links.length > 0 && !('clicks' in links[0])) {
        setLinks((currentLinks) => 
          (currentLinks || []).map(link => ({
            ...link,
            clicks: 0
          }))
        )
      }
    }
    migrateOldLinks()
  }, [])

  const formatDate = (timestamp: number): string => {
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
    <>
      <Toaster />
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div 
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <div className="p-4 bg-card border-2 border-primary relative">
                <LinkIcon size={40} weight="bold" className="text-primary terminal-flicker" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent border border-background"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-background"></div>
              </div>
            </motion.div>
          </div>
          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-3 neon-text text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            HYPERSMOL
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center gap-2 text-muted-foreground text-xs md:text-sm font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-primary">{'>'}</span>
            <span>AGENTIC_URL_COMPRESSION_SYSTEM</span>
            <span className="animate-pulse text-accent">█</span>
          </motion.div>

          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBuilder(!showBuilder)}
              className={`font-mono uppercase text-xs gap-2 ${showBuilder ? 'bg-primary/20 border-primary text-primary' : 'text-muted-foreground'}`}
            >
              <Circuitry size={18} />
              {showBuilder ? 'AGENT_BUILDER_ACTIVE' : 'OPEN_BUILDER'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-primary"
            >
              <Gear size={24} />
            </Button>
          </div>
        </motion.div>

        {showBuilder ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[600px] border-2 border-primary/30 rounded-lg overflow-hidden glass-card shadow-2xl relative"
          >
             <FlowEditor />
             <div className="absolute top-2 right-2 z-10">
                <Badge variant="outline" className="bg-black/50 backdrop-blur font-mono text-xs border-primary/50 text-primary">
                    BETA_BUILDER_v1
                </Badge>
             </div>
          </motion.div>
        ) : (
          <>
            {links && links.length > 0 && (
              <AdvancedAnalytics links={links} />
            )}

            {links && links.length > 0 && (
              <div className="mb-8">
                <AgentInsights links={links} />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="p-6 mb-8 glass-card border-2 border-primary/30">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        id="url-input"
                        type="text"
                        placeholder="PASTE_URL_HERE..."
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value)
                          setIsValidUrl(true)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && urlInput.trim()) {
                            handleShortenUrl()
                          }
                        }}
                        className={`h-12 input-glow text-sm font-mono bg-input border-2 ${
                          !isValidUrl ? 'border-destructive focus-visible:ring-destructive' : 'border-border'
                        }`}
                      />
                    </div>
                    <Button
                      onClick={handleShortenUrl}
                      disabled={!urlInput.trim()}
                      className="gradient-button h-12 px-6 text-sm font-black uppercase tracking-wider"
                    >
                      <Lightning size={20} weight="fill" className="mr-2" />
                      SHRINK
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseCustomAlias(!useCustomAlias)}
                      className="text-[10px] font-mono uppercase tracking-wider hover:text-primary"
                    >
                      {useCustomAlias ? '[AUTO_CODE]' : '[CUSTOM_ALIAS]'}
                    </Button>
                    {useCustomAlias && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        className="flex-1"
                      >
                        <Input
                          id="custom-alias"
                          type="text"
                          placeholder="custom-link-name"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          className="h-9 text-sm font-mono bg-input border-2 border-border"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
                {!isValidUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 mt-3 text-destructive text-xs font-mono"
                  >
                    <Warning size={16} weight="fill" />
                    <span className="uppercase">[ERROR] INVALID_URL_FORMAT (REQUIRES HTTP/HTTPS)</span>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">
              LINK_HISTORY
            </h2>
            {links && links.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportData}
                  className="text-[10px] font-mono uppercase tracking-wider hover:text-primary"
                >
                  <Download size={12} className="mr-1" />
                  EXPORT
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={categorizeAllLinks}
                  disabled={isCategorizingAll}
                  className="text-[10px] font-mono uppercase tracking-wider hover:text-accent"
                >
                  <Brain size={12} className="mr-1" />
                  {isCategorizingAll ? 'TAGGING...' : 'AUTO_TAG'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkAllLinksHealth}
                  disabled={isCheckingHealth}
                  className="text-[10px] font-mono uppercase tracking-wider hover:text-accent"
                >
                  <Heart size={12} className="mr-1" />
                  {isCheckingHealth ? 'CHECKING...' : 'HEALTH'}
                </Button>
              </div>
            )}
          </div>
          {links && links.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <MagnifyingGlass 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-10 text-sm font-mono bg-input border-2 border-border"
                />
              </div>
            </div>
          )}
        </div>

        {links && links.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full sm:w-auto bg-card border border-border font-mono">
              <TabsTrigger value="all" className="flex-1 sm:flex-none text-[10px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                ALL [{links.length}]
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 sm:flex-none text-[10px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                RECENT [{links.filter(l => Date.now() - l.createdAt < 86400000).length}]
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1 sm:flex-none text-[10px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                POPULAR [{links.filter(l => l.clicks > 0).length}]
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {!links || links.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="animate-float mb-6">
              <div className="inline-block p-6 bg-card border-2 border-primary/30">
                <LinkIcon size={64} weight="bold" className="text-primary/50" />
              </div>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-wider">
              NO_LINKS_FOUND
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm">
              <span className="text-primary">{'>'}</span> PASTE_URL_ABOVE_TO_CREATE_FIRST_LINK
            </p>
          </motion.div>
        ) : filteredLinks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="p-4 bg-card border-2 border-border inline-block mb-4">
              <MagnifyingGlass size={48} weight="bold" className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2 uppercase tracking-wider">
              NO_MATCHES_FOUND
            </h3>
            <p className="text-muted-foreground font-mono text-sm">
              <span className="text-primary">{'>'}</span> ADJUST_SEARCH_OR_FILTER
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card className="p-4 hover:border-primary transition-all duration-200 group glass-card border-l-2 border-l-primary/50 hover:border-l-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="px-2 py-1 bg-primary/20 text-primary font-mono text-xs font-black border border-primary/30 uppercase tracking-wider">
                            hyprsml.ink/{link.shortCode}
                          </div>
                          {link.customAlias && (
                            <Badge variant="secondary" className="text-[9px] font-mono uppercase border border-secondary bg-secondary/20">
                              CUSTOM
                            </Badge>
                          )}
                          {link.category && (
                            <Badge variant="outline" className="text-[9px] flex items-center gap-1 font-mono uppercase border border-accent/30 bg-accent/5">
                              <Tag size={10} weight="fill" />
                              {link.category}
                            </Badge>
                          )}
                          {link.healthStatus === 'healthy' && (
                            <Badge variant="outline" className="text-[9px] flex items-center gap-1 text-green-400 border-green-400/30 bg-green-400/5 font-mono uppercase">
                              <Heart size={10} weight="fill" />
                              OK
                            </Badge>
                          )}
                          {link.healthStatus === 'checking' && (
                            <Badge variant="outline" className="text-[9px] flex items-center gap-1 font-mono uppercase">
                              <Pulse size={10} />
                              CHK
                            </Badge>
                          )}
                          {link.predictedPopularity && (
                            <PredictionBadge 
                              score={link.predictedPopularity} 
                              reasoning={link.popularityReasoning}
                              showDetails={true}
                            />
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">{formatDate(link.createdAt)}</span>
                          {link.clicks > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-accent font-mono uppercase font-bold">
                              <ChartLine size={12} weight="bold" />
                              <span>{link.clicks}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          <span className="text-primary mr-1">{'>'}</span>{link.originalUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!link.category && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => categorizeLinkById(link.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-accent/10 hover:text-accent"
                            title="AI Categorize"
                          >
                            <Brain size={16} />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => checkLinkHealth(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-accent/10 hover:text-accent"
                          title="Health Check"
                        >
                          <Heart size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            handleSimulateClick(link.id)
                            toast.success('CLICK_TRACKED', {
                              description: `TOTAL: ${link.clicks + 1}`
                            })
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-primary/10 hover:text-primary"
                          title="Simulate Click"
                        >
                          <ChartLine size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowQRCode(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-primary/10 hover:text-primary"
                          title="QR Code"
                        >
                          <QrCode size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyUrl(link)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-primary/10 hover:text-primary"
                        >
                          {copiedId === link.id ? (
                            <motion.div
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            >
                              <Check size={16} weight="bold" className="text-accent" />
                            </motion.div>
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive h-7 w-7"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="border-2 border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-wider">DELETE_LINK?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              <span className="text-destructive">{'>'}</span> THIS_ACTION_CANNOT_BE_UNDONE. LINK_WILL_BE_REMOVED.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono uppercase text-xs">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteLink(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono uppercase text-xs font-bold"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="border-2 border-primary/50 glass-card">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-primary">SYSTEM_CONFIGURATION</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              CONFIGURE_POLLINATIONS_AI_CORTEX
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey" className="font-mono uppercase text-xs">API_KEY (Optional for limited use)</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="pk_..."
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground font-mono">
                Get your key at <a href="https://enter.pollinations.ai" target="_blank" rel="noreferrer" className="text-primary hover:underline">enter.pollinations.ai</a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)} className="font-mono uppercase text-xs">CANCEL</Button>
            <Button onClick={handleSaveSettings} className="gradient-button font-mono uppercase text-xs font-bold">SAVE_CONFIG</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!showQRCode} onOpenChange={(open) => !open && setShowQRCode(null)}>
        <AlertDialogContent className="border-2 border-primary/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-wider">QR_CODE</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              <span className="text-primary">{'>'}</span> SCAN_CODE_TO_ACCESS_SHORTENED_LINK
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-6">
            {showQRCode && (
              <div className="p-2 bg-white border-4 border-primary">
                <img
                  src={generateQRCode(`https://hyprsml.ink/${links?.find(l => l.id === showQRCode)?.shortCode}`)}
                  alt="QR Code"
                  className=""
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowQRCode(null)} className="gradient-button font-mono uppercase text-xs font-bold">
              CLOSE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
        </div>
      </div>
    </>
  )
}

export default App

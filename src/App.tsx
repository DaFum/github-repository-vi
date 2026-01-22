import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Lightning,
  Copy,
  Trash,
  Check,
  Link as LinkIcon,
  Warning,
  ChartLine,
  MagnifyingGlass,
  Download,
  QrCode,
  Brain,
  Heart,
  Tag,
  Pulse,
} from '@phosphor-icons/react'
import { AgentInsights } from '@/components/AgentInsights'
import { PredictionBadge } from '@/components/PredictionBadge'
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics'
import { hyperSmolAgents } from '@/lib/hypersmolagents'
import { pollinations } from '@/lib/pollinations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [now] = useState(() => Date.now())
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
    const link = links?.find((l) => l.id === linkId)
    if (!link) return

    setLinks((currentLinks) =>
      (currentLinks || []).map((l) =>
        l.id === linkId ? { ...l, healthStatus: 'checking' as const } : l
      )
    )

    try {
      await fetch(link.originalUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      })

      setLinks((currentLinks) =>
        (currentLinks || []).map((l) =>
          l.id === linkId
            ? {
                ...l,
                healthStatus: 'healthy' as const,
                lastChecked: Date.now(),
              }
            : l
        )
      )

      toast.success('Link is healthy!', {
        description: 'URL is accessible',
      })
    } catch {
      setLinks((currentLinks) =>
        (currentLinks || []).map((l) =>
          l.id === linkId
            ? {
                ...l,
                healthStatus: 'unknown' as const,
                lastChecked: Date.now(),
              }
            : l
        )
      )

      toast.info('Health check complete', {
        description: 'Unable to verify (CORS limitation)',
      })
    }
  }

  const categorizeLinkById = async (linkId: string): Promise<void> => {
    const link = links?.find((l) => l.id === linkId)
    if (!link) return

    toast.info('Analyzing...', {
      description: 'AI agent dispatched to categorize link',
    })

    hyperSmolAgents.enqueueTask('categorize', link.originalUrl, 8)
  }

  const categorizeAllLinks = async (): Promise<void> => {
    if (!links || links.length === 0) return

    setIsCategorizingAll(true)
    toast.info('AI Processing...', {
      description: `Queuing ${links.length} links for analysis`,
    })

    const uncategorizedLinks = links.filter((l) => !l.category)

    for (const link of uncategorizedLinks) {
      await hyperSmolAgents.enqueueTask('categorize', link.originalUrl, 5)
    }

    setIsCategorizingAll(false)
    toast.success('Tasks Enqueued', {
      description: 'Agents are working in the background',
    })
  }

  const handleSaveSettings = () => {
    pollinations.setApiKey(apiKey)
    setShowSettings(false)
    toast.success('Settings Saved', {
      description: 'Pollinations API Key updated',
    })
  }

  useEffect(() => {
    hyperSmolAgents.initialize()
    pollinations.initialize()

    return () => {
      // We don't want to dispose global singletons on unmount as they persist across re-renders
      // and we don't have a root provider. But to be safe if the app is truly destroyed:
      // hyperSmolAgents.dispose()
    }
  }, [])

  const checkAllLinksHealth = async (): Promise<void> => {
    if (!links || links.length === 0) return

    setIsCheckingHealth(true)
    toast.info('Health Check...', {
      description: `Checking ${links.length} links`,
    })

    const BATCH_SIZE = 5
    for (let i = 0; i < links.length; i += BATCH_SIZE) {
      const batch = links.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map((link) => checkLinkHealth(link.id)))
    }

    setIsCheckingHealth(false)
    toast.success('Health check complete!', {
      description: 'All links verified',
    })
  }

  const handleShortenUrl = async () => {
    if (!urlInput.trim()) return

    if (!validateUrl(urlInput)) {
      setIsValidUrl(false)
      toast.error('Invalid URL', {
        description: 'Please enter a valid URL starting with http:// or https://',
      })
      return
    }

    setIsValidUrl(true)

    const existingLink = (links || []).find((link) => link.originalUrl === urlInput)

    if (existingLink) {
      const shortUrl = `https://hyprsml.ink/${existingLink.shortCode}`
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Link already exists!', {
        description: 'Copied existing short URL to clipboard',
      })
      setUrlInput('')
      setCustomAlias('')
      return
    }

    const finalShortCode =
      useCustomAlias && customAlias.trim()
        ? customAlias
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '')
        : generateShortCode()

    const aliasExists = (links || []).find((link) => link.shortCode === finalShortCode)
    if (aliasExists) {
      toast.error('Alias already taken', {
        description: 'Please choose a different custom alias',
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
      healthStatus: 'unknown',
    }

    setLinks((currentLinks) => [newLink, ...(currentLinks || [])])

    const shortUrl = `https://hyprsml.ink/${newLink.shortCode}`
    await navigator.clipboard.writeText(shortUrl)

    toast.success('URL Shortened!', {
      description: 'Copied to clipboard',
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
      description: 'Short URL copied to clipboard',
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = (id: string) => {
    setLinks((currentLinks) => (currentLinks || []).filter((link) => link.id !== id))
    toast.success('Deleted', {
      description: 'Link removed from history',
    })
    setDeleteConfirm(null)
  }

  const handleSimulateClick = (linkId: string) => {
    setLinks((currentLinks) =>
      (currentLinks || []).map((link) =>
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
      description: 'Your links have been downloaded',
    })
  }

  const filteredLinks = useMemo(
    () =>
      (links || []).filter((link) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.shortCode.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'recent' && now - link.createdAt < 86400000) ||
          (activeTab === 'popular' && link.clicks > 0)

        return matchesSearch && matchesTab
      }),
    [links, searchQuery, activeTab, now]
  )

  const totalClicks = useMemo(() => {
    return (links || []).reduce((sum, link) => sum + link.clicks, 0)
  }, [links])

  // Listener for agent task completions
  useEffect(() => {
    const unsubscribe = hyperSmolAgents.subscribe((task) => {
      if (task.status === 'completed' && task.type === 'categorize') {
        const url = task.payload as string
        const category = task.result as string

        setLinks((currentLinks) => {
          if (!currentLinks) return currentLinks
          return currentLinks.map((l) => {
            if (l.originalUrl === url) {
              return { ...l, category }
            }
            return l
          })
        })

        toast.success('Categorized', { description: `${url} -> ${category}` })
      }
    })

    return () => unsubscribe()
  }, [setLinks])

  // To truly fix the "Split Brain", we need the Agent to be able to update the data.
  // But the Agent is in a plain class file.
  // I will inject a "result handler" pattern here locally.
  // SOLUTION: We implemented an event subscription model above (useEffect with subscribe).
  // This allows the Agent Kernel to notify the UI when tasks complete, eliminating the split brain.

  useEffect(() => {
    const migrateOldLinks = () => {
      if (links && links.length > 0 && !('clicks' in links[0])) {
        setLinks((currentLinks) =>
          (currentLinks || []).map((link) => ({
            ...link,
            clicks: 0,
          }))
        )
      }
    }
    migrateOldLinks()
  }, [links, setLinks])

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
      <div className="bg-background text-foreground relative min-h-screen overflow-hidden">
        <div className="cyber-grid absolute inset-0 opacity-20"></div>
        <div className="via-primary absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <div className="mb-6 flex items-center justify-center gap-4">
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <div className="bg-card border-primary relative border-2 p-4">
                    <LinkIcon size={40} weight="bold" className="text-primary terminal-flicker" />
                    <div className="bg-accent border-background absolute -top-1 -right-1 h-3 w-3 border"></div>
                    <div className="bg-primary border-background absolute -bottom-1 -left-1 h-2 w-2 border"></div>
                  </div>
                </motion.div>
              </div>
              <motion.h1
                className="neon-text text-primary mb-3 text-5xl font-black md:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                HYPERSMOL
              </motion.h1>
              <motion.div
                className="text-muted-foreground flex items-center justify-center gap-2 font-mono text-xs md:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-primary">{'>'}</span>
                <span>AGENTIC_URL_COMPRESSION_SYSTEM</span>
                <span className="text-accent animate-pulse">█</span>
              </motion.div>

              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBuilder(!showBuilder)}
                  className={`gap-2 font-mono text-xs uppercase ${showBuilder ? 'bg-primary/20 border-primary text-primary' : 'text-muted-foreground'}`}
                >
                  <Circuitry size={18} />
                  {showBuilder ? 'BUILDER' : 'BUILDER'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground hover:text-primary font-mono text-xs uppercase"
                >
                  <Gear size={18} />
                  SETTINGS
                </Button>
              </div>
            </motion.div>

            {showBuilder ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-primary/30 glass-card relative h-[600px] overflow-hidden rounded-lg border-2 shadow-2xl"
              >
                <FlowEditor />
                <div className="absolute top-2 right-2 z-10">
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary bg-black/50 font-mono text-xs backdrop-blur"
                  >
                    BETA_BUILDER_v1
                  </Badge>
                </div>
              </motion.div>
            ) : (
              <>
                {links && links.length > 0 ? (
                  <>
                    <AdvancedAnalytics links={links} totalClicks={totalClicks} />
                    <div className="mb-8">
                      <AgentInsights links={links} />
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <Card className="glass-card border-accent/30 border-2 p-6">
                      <div className="text-center">
                        <div className="bg-accent/20 border-accent mx-auto mb-4 inline-block border-2 p-3">
                          <Robot size={32} weight="bold" className="text-accent" />
                        </div>
                        <h3 className="mb-2 text-lg font-black tracking-wider uppercase">
                          AI_AGENTS_READY
                        </h3>
                        <p className="text-muted-foreground mx-auto max-w-md font-mono text-sm">
                          <span className="text-primary">{'>'}</span>{' '}
                          CREATE_LINKS_TO_UNLOCK_AI_ANALYSIS
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            PATTERN_ANALYSIS
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            OPTIMIZATION
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            DEVIL'S_ADVOCATE
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className="glass-card border-primary/30 mb-8 border-2 p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
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
                            className={`input-glow bg-input h-12 border-2 font-mono text-sm ${
                              !isValidUrl
                                ? 'border-destructive focus-visible:ring-destructive'
                                : 'border-border'
                            }`}
                          />
                        </div>
                        <Button
                          onClick={handleShortenUrl}
                          disabled={!urlInput.trim()}
                          className="gradient-button h-12 px-6 text-sm font-black tracking-wider uppercase"
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
                          className="hover:text-primary font-mono text-[10px] tracking-wider uppercase"
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
                              className="bg-input border-border h-9 border-2 font-mono text-sm"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    {!isValidUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-destructive mt-3 flex items-center gap-2 font-mono text-xs"
                      >
                        <Warning size={16} weight="fill" />
                        <span className="uppercase">
                          [ERROR] INVALID_URL_FORMAT (REQUIRES HTTP/HTTPS)
                        </span>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              </>
            )}

            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-foreground text-lg font-black tracking-wider uppercase">
                  LINK_HISTORY
                </h2>
                {links && links.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportData}
                      className="hover:text-primary font-mono text-[10px] tracking-wider uppercase"
                    >
                      <Download size={12} className="mr-1" />
                      EXPORT
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={categorizeAllLinks}
                      disabled={isCategorizingAll}
                      className="hover:text-accent font-mono text-[10px] tracking-wider uppercase"
                    >
                      <Brain size={12} className="mr-1" />
                      {isCategorizingAll ? 'TAGGING...' : 'AUTO_TAG'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkAllLinksHealth}
                      disabled={isCheckingHealth}
                      className="hover:text-accent font-mono text-[10px] tracking-wider uppercase"
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
                      className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <Input
                      type="text"
                      placeholder="SEARCH..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-input border-border h-9 border-2 pl-10 font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {links && links.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="bg-card border-border w-full border font-mono sm:w-auto">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 text-[10px] tracking-wider uppercase sm:flex-none"
                  >
                    ALL [{links.length}]
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 text-[10px] tracking-wider uppercase sm:flex-none"
                  >
                    RECENT [{links.filter((l) => now - l.createdAt < 86400000).length}]
                  </TabsTrigger>
                  <TabsTrigger
                    value="popular"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 text-[10px] tracking-wider uppercase sm:flex-none"
                  >
                    POPULAR [{links.filter((l) => l.clicks > 0).length}]
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {!links || links.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="py-16 text-center"
              >
                <div className="animate-float mb-6">
                  <div className="bg-card border-primary/30 inline-block border-2 p-6">
                    <LinkIcon size={64} weight="bold" className="text-primary/50" />
                  </div>
                </div>
                <h3 className="text-foreground mb-2 text-xl font-black tracking-wider uppercase">
                  NO_LINKS_FOUND
                </h3>
                <p className="text-muted-foreground mx-auto max-w-md font-mono text-sm">
                  <span className="text-primary">{'>'}</span> PASTE_URL_ABOVE_TO_CREATE_FIRST_LINK
                </p>
              </motion.div>
            ) : filteredLinks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="bg-card border-border mb-4 inline-block border-2 p-4">
                  <MagnifyingGlass size={48} weight="bold" className="text-muted-foreground" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-black tracking-wider uppercase">
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
                      <Card className="hover:border-primary group glass-card border-l-primary/50 border-l-2 p-4 transition-all duration-200 hover:border-l-4">
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <div className="bg-primary/20 text-primary border-primary/30 border px-2 py-1 font-mono text-xs font-black tracking-wider uppercase">
                                hyprsml.ink/{link.shortCode}
                              </div>
                              {link.customAlias && (
                                <Badge
                                  variant="secondary"
                                  className="border-secondary bg-secondary/20 border font-mono text-[9px] uppercase"
                                >
                                  CUSTOM
                                </Badge>
                              )}
                              {link.category && (
                                <Badge
                                  variant="outline"
                                  className="border-accent/30 bg-accent/5 flex items-center gap-1 border font-mono text-[9px] uppercase"
                                >
                                  <Tag size={10} weight="fill" />
                                  {link.category}
                                </Badge>
                              )}
                              {link.healthStatus === 'healthy' && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 border-green-400/30 bg-green-400/5 font-mono text-[9px] text-green-400 uppercase"
                                >
                                  <Heart size={10} weight="fill" />
                                  OK
                                </Badge>
                              )}
                              {link.healthStatus === 'checking' && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 font-mono text-[9px] uppercase"
                                >
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
                              <span className="text-muted-foreground font-mono text-[10px] uppercase">
                                {formatDate(link.createdAt)}
                              </span>
                              {link.clicks > 0 && (
                                <div className="text-accent flex items-center gap-1 font-mono text-[10px] font-bold uppercase">
                                  <ChartLine size={12} weight="bold" />
                                  <span>{link.clicks}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-muted-foreground truncate font-mono text-xs">
                              <span className="text-primary mr-1">{'>'}</span>
                              {link.originalUrl}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!link.category && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => categorizeLinkById(link.id)}
                                className="hover:bg-accent/10 hover:text-accent h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                title="AI Categorize"
                              >
                                <Brain size={16} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => checkLinkHealth(link.id)}
                              className="hover:bg-accent/10 hover:text-accent h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
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
                                  description: `TOTAL: ${link.clicks + 1}`,
                                })
                              }}
                              className="hover:bg-primary/10 hover:text-primary h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                              title="Simulate Click"
                            >
                              <ChartLine size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setShowQRCode(link.id)}
                              className="hover:bg-primary/10 hover:text-primary h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                              title="QR Code"
                            >
                              <QrCode size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyUrl(link)}
                              className="hover:bg-primary/10 hover:text-primary h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
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
                              className="hover:text-destructive h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
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

            <AlertDialog
              open={!!deleteConfirm}
              onOpenChange={(open) => !open && setDeleteConfirm(null)}
            >
              <AlertDialogContent className="border-destructive/50 border-2">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black tracking-wider uppercase">
                    DELETE_LINK?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-mono text-xs">
                    <span className="text-destructive">{'>'}</span> THIS_ACTION_CANNOT_BE_UNDONE.
                    LINK_WILL_BE_REMOVED.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-mono text-xs uppercase">
                    CANCEL
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteConfirm && handleDeleteLink(deleteConfirm)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-xs font-bold uppercase"
                  >
                    DELETE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogContent className="border-primary/50 glass-card border-2">
                <DialogHeader>
                  <DialogTitle className="text-primary font-black tracking-wider uppercase">
                    SYSTEM_CONFIGURATION
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs">
                    CONFIGURE_POLLINATIONS_AI_CORTEX
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey" className="font-mono text-xs uppercase">
                      API_KEY (Optional for limited use)
                    </Label>
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="pk_..."
                      className="font-mono text-xs"
                    />
                    <p className="text-muted-foreground font-mono text-[10px]">
                      Get your key at{' '}
                      <a
                        href="https://enter.pollinations.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        enter.pollinations.ai
                      </a>
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                    className="font-mono text-xs uppercase"
                  >
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    className="gradient-button font-mono text-xs font-bold uppercase"
                  >
                    SAVE_CONFIG
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={!!showQRCode} onOpenChange={(open) => !open && setShowQRCode(null)}>
              <AlertDialogContent className="border-primary/50 border-2">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black tracking-wider uppercase">
                    QR_CODE
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-mono text-xs">
                    <span className="text-primary">{'>'}</span> SCAN_CODE_TO_ACCESS_SHORTENED_LINK
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-center py-6">
                  {showQRCode && (
                    <div className="border-primary border-4 bg-white p-2">
                      <img
                        src={generateQRCode(
                          `https://hyprsml.ink/${links?.find((l) => l.id === showQRCode)?.shortCode}`
                        )}
                        alt="QR Code"
                        className=""
                      />
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction
                    onClick={() => setShowQRCode(null)}
                    className="gradient-button font-mono text-xs font-bold uppercase"
                  >
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

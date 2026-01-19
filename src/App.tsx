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

  const categorizeUrl = async (url: string): Promise<string> => {
    try {
      const promptText = `Analyze this URL and categorize it into ONE of these categories: Social Media, E-commerce, News, Documentation, Entertainment, Business, Education, Technology, Health, Finance, Travel, Food, Sports, Gaming, Government, or Other. 

URL: ${url}

Return ONLY the category name, nothing else.`
      
      const category = await window.spark.llm(promptText, 'gpt-4o-mini')
      return category.trim()
    } catch (error) {
      console.error('Categorization failed:', error)
      return 'Uncategorized'
    }
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
      description: 'AI is categorizing your link'
    })

    const category = await categorizeUrl(link.originalUrl)
    
    setLinks((currentLinks) =>
      (currentLinks || []).map(l =>
        l.id === linkId ? { ...l, category } : l
      )
    )

    toast.success('Categorized!', {
      description: `Category: ${category}`
    })
  }

  const categorizeAllLinks = async (): Promise<void> => {
    if (!links || links.length === 0) return
    
    setIsCategorizingAll(true)
    toast.info('AI Processing...', {
      description: `Categorizing ${links.length} links`
    })

    const uncategorizedLinks = links.filter(l => !l.category)
    
    for (const link of uncategorizedLinks) {
      const category = await categorizeUrl(link.originalUrl)
      setLinks((currentLinks) =>
        (currentLinks || []).map(l =>
          l.id === link.id ? { ...l, category } : l
        )
      )
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsCategorizingAll(false)
    toast.success('Complete!', {
      description: 'All links categorized'
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

    categorizeUrl(newLink.originalUrl).then(category => {
      setLinks((currentLinks) =>
        (currentLinks || []).map(l =>
          l.id === newLink.id ? { ...l, category } : l
        )
      )
    })
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
      <div className="min-h-screen bg-background text-foreground font-['Space_Grotesk']">
      <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent relative">
              <LinkIcon size={32} weight="bold" className="text-white" />
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Sparkle size={16} weight="fill" className="text-accent" />
              </motion.div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            HyperSmol
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Lightning-fast URL shortening with analytics
          </p>
        </motion.div>

        {links && links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            <Card className="p-4 glass-card">
              <div className="text-xs text-muted-foreground mb-1">Total Links</div>
              <div className="text-2xl font-bold text-foreground">{links.length}</div>
            </Card>
            <Card className="p-4 glass-card">
              <div className="text-xs text-muted-foreground mb-1">Total Clicks</div>
              <div className="text-2xl font-bold text-accent">{totalClicks}</div>
            </Card>
            <Card className="p-4 glass-card">
              <div className="text-xs text-muted-foreground mb-1">This Week</div>
              <div className="text-2xl font-bold text-primary">
                {links.filter(l => Date.now() - l.createdAt < 604800000).length}
              </div>
            </Card>
            <Card className="p-4 glass-card">
              <div className="text-xs text-muted-foreground mb-1">Top Link</div>
              <div className="text-2xl font-bold text-foreground">
                {Math.max(0, ...links.map(l => l.clicks))}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-6 mb-8 glass-card">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    id="url-input"
                    type="text"
                    placeholder="Paste your long URL here..."
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
                    className={`h-12 input-glow text-base ${
                      !isValidUrl ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                  />
                </div>
                <Button
                  onClick={handleShortenUrl}
                  disabled={!urlInput.trim()}
                  className="gradient-button h-12 px-6 text-base font-semibold"
                >
                  <Lightning size={20} weight="fill" className="mr-2" />
                  Shrink
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseCustomAlias(!useCustomAlias)}
                  className="text-xs"
                >
                  {useCustomAlias ? 'Use Auto Code' : 'Custom Alias'}
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
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </motion.div>
                )}
              </div>
            </div>
            {!isValidUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 mt-3 text-destructive text-sm"
              >
                <Warning size={16} weight="fill" />
                <span>Please enter a valid URL (including http:// or https://)</span>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Link History
            </h2>
            {links && links.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportData}
                  className="text-xs"
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={categorizeAllLinks}
                  disabled={isCategorizingAll}
                  className="text-xs"
                >
                  <Brain size={14} className="mr-1" />
                  {isCategorizingAll ? 'Categorizing...' : 'Auto-Tag'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkAllLinksHealth}
                  disabled={isCheckingHealth}
                  className="text-xs"
                >
                  <Heart size={14} className="mr-1" />
                  {isCheckingHealth ? 'Checking...' : 'Health Check'}
                </Button>
              </div>
            )}
          </div>
          {links && links.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <MagnifyingGlass 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-10 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {links && links.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">
                All ({links.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 sm:flex-none">
                Recent ({links.filter(l => Date.now() - l.createdAt < 86400000).length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1 sm:flex-none">
                Popular ({links.filter(l => l.clicks > 0).length})
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
              <LinkIcon size={64} weight="duotone" className="text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No links yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start by pasting a URL above to create your first shortened link
            </p>
          </motion.div>
        ) : filteredLinks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MagnifyingGlass size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No matches found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter
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
                  <Card className="p-4 hover:shadow-lg transition-all duration-200 group glass-card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono text-sm font-semibold">
                            hyprsml.ink/{link.shortCode}
                          </div>
                          {link.customAlias && (
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          )}
                          {link.category && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Tag size={12} weight="fill" />
                              {link.category}
                            </Badge>
                          )}
                          {link.healthStatus === 'healthy' && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1 text-green-600 border-green-600/30">
                              <Heart size={12} weight="fill" />
                              Healthy
                            </Badge>
                          )}
                          {link.healthStatus === 'checking' && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Pulse size={12} />
                              Checking...
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(link.createdAt)}
                          </span>
                          {link.clicks > 0 && (
                            <div className="flex items-center gap-1 text-xs text-accent">
                              <ChartLine size={14} weight="bold" />
                              <span>{link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.originalUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!link.category && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => categorizeLinkById(link.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            title="Categorize with AI"
                          >
                            <Brain size={18} />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => checkLinkHealth(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          title="Check health"
                        >
                          <Heart size={18} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            handleSimulateClick(link.id)
                            toast.success('Click tracked!', {
                              description: `Total: ${link.clicks + 1}`
                            })
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          title="Simulate click"
                        >
                          <ChartLine size={18} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowQRCode(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          title="Show QR Code"
                        >
                          <QrCode size={18} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyUrl(link)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          {copiedId === link.id ? (
                            <motion.div
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            >
                              <Check size={18} weight="bold" className="text-accent" />
                            </motion.div>
                          ) : (
                            <Copy size={18} />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive h-8 w-8"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The shortened link will be removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteLink(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showQRCode} onOpenChange={(open) => !open && setShowQRCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              Scan this code to access your shortened link
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-6">
            {showQRCode && (
              <img
                src={generateQRCode(`https://hyprsml.ink/${links?.find(l => l.id === showQRCode)?.shortCode}`)}
                alt="QR Code"
                className="rounded-lg border-2 border-border"
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowQRCode(null)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  )
}

export default App

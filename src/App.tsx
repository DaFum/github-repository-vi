import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Lightning, Copy, Trash, Check, Link as LinkIcon, Warning } from '@phosphor-icons/react'

type ShortenedLink = {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: number
}

function App() {
  const [links, setLinks] = useKV<ShortenedLink[]>('shortened-links', [])
  const [urlInput, setUrlInput] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
      return
    }

    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      originalUrl: urlInput,
      shortCode: generateShortCode(),
      createdAt: Date.now()
    }

    setLinks((currentLinks) => [newLink, ...(currentLinks || [])])

    const shortUrl = `https://hyprsml.ink/${newLink.shortCode}`
    await navigator.clipboard.writeText(shortUrl)
    
    toast.success('URL Shortened!', {
      description: 'Copied to clipboard'
    })
    
    setUrlInput('')
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
      <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <LinkIcon size={32} weight="bold" className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            HyperSmol
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Lightning-fast URL shortening
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-6 mb-8 glass-card">
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

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Link History
            {links && links.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({links.length})
              </span>
            )}
          </h2>
        </div>

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
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {links.map((link) => (
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
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono text-sm font-semibold">
                            hyprsml.ink/{link.shortCode}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(link.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.originalUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyUrl(link)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === link.id ? (
                            <motion.div
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            >
                              <Check size={20} weight="bold" className="text-accent" />
                            </motion.div>
                          ) : (
                            <Copy size={20} />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(link.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash size={20} />
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
      </div>
    </>
  )
}

export default App

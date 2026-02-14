import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useVaultStore } from '@/lib/store/useVaultStore'
import { ArtifactCard } from './ArtifactCard'
import {
  MagnifyingGlass,
  Vault,
  Image as ImageIcon,
  ChatCircle,
  FlowArrow,
  Trash,
  DownloadSimple,
  UploadSimple
} from '@phosphor-icons/react'

/**
 * Artifact Vault Component
 *
 * Displays and manages stored artifacts (images, chats, workflows).
 * Provides search, filtering, export, and import capabilities.
 */
export function ArtifactVault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'chats' | 'workflows'>('all')

  const { artifacts, removeArtifact, clearAll, exportVault, importVault } = useVaultStore()

  const filteredArtifacts = useMemo(() => {
    let filtered = artifacts
    if (activeTab !== 'all') {
      filtered = filtered.filter((artifact) => {
        if (activeTab === 'images') return artifact.type === 'image'
        if (activeTab === 'chats') return artifact.type === 'chat'
        if (activeTab === 'workflows') return artifact.type === 'workflow'
        return true
      })
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (artifact) =>
          artifact.title.toLowerCase().includes(query) ||
          artifact.description?.toLowerCase().includes(query) ||
          artifact.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp)
  }, [artifacts, activeTab, searchQuery])

  const handleExport = () => exportVault()
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string)
            importVault(data)
          } catch (error) {
            toast.error('Import failed: Invalid JSON')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getTabIcon = (tab: typeof activeTab) => {
    switch (tab) {
      case 'images': return <ImageIcon size={16} weight="fill" />
      case 'chats': return <ChatCircle size={16} weight="fill" />
      case 'workflows': return <FlowArrow size={16} weight="fill" />
      default: return <Vault size={16} weight="fill" />
    }
  }

  const getTabCount = (tab: typeof activeTab) => {
    if (tab === 'all') return artifacts.length
    if (tab === 'images') return artifacts.filter((a) => a.type === 'image').length
    if (tab === 'chats') return artifacts.filter((a) => a.type === 'chat').length
    if (tab === 'workflows') return artifacts.filter((a) => a.type === 'workflow').length
    return 0
  }

  return (
    <Card className="flex flex-col h-full bg-black/80 border-primary/20 backdrop-blur-md rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-black/40">
        <div className="flex items-center gap-3">
          <Badge variant="neon" className="gap-2 px-3 py-1">
            <Vault size={14} weight="fill" />
            ARTIFACT_VAULT
          </Badge>
          <span className="text-[10px] text-primary/50 font-share-tech uppercase tracking-widest hidden sm:inline-block">
            SECURE_STORAGE_V2
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="holographic" size="sm">
            <DownloadSimple size={16} className="mr-2" /> EXPORT
          </Button>
          <Button onClick={handleImport} variant="holographic" size="sm">
            <UploadSimple size={16} className="mr-2" /> IMPORT
          </Button>
          <Button
            onClick={clearAll}
            variant="destructive"
            size="sm"
            disabled={artifacts.length === 0}
            className="ml-2"
          >
            <Trash size={16} className="mr-2" /> PURGE
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-primary/20 space-y-4 bg-black/20">
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_DATABASE..."
            className="pl-10 bg-black/50 border-primary/30 text-primary font-share-tech uppercase placeholder:text-primary/20 rounded-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-transparent border-b border-primary/20 w-full justify-start gap-4 p-0 h-auto rounded-none">
            {['all', 'images', 'chats', 'workflows'].map((tab) => (
               <TabsTrigger
                 key={tab}
                 value={tab}
                 className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-2 font-orbitron text-xs uppercase tracking-wider text-muted-foreground transition-all hover:text-primary"
               >
                 {getTabIcon(tab as any)}
                 <span className="ml-2">{tab.toUpperCase()} ({getTabCount(tab as any)})</span>
               </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-black/60 relative">
         <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
         <ScrollArea className="h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
               <AnimatePresence mode="popLayout">
                  {filteredArtifacts.length === 0 ? (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center text-primary/30"
                     >
                        <Vault size={64} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-orbitron tracking-widest">NO_DATA_FOUND</h3>
                     </motion.div>
                  ) : (
                     filteredArtifacts.map((artifact) => (
                        <ArtifactCard key={artifact.id} artifact={artifact} onRemove={() => removeArtifact(artifact.id)} />
                     ))
                  )}
               </AnimatePresence>
            </div>
         </ScrollArea>
      </div>
    </Card>
  )
}

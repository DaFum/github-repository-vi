import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from '@phosphor-icons/react'

/**
 * Artifact Vault Module
 *
 * Centralized history and storage management:
 * - Image generations (from Canvas)
 * - Chat conversations (from Holo-Chat)
 * - Workflow blueprints (from Synapse)
 * - Search and filter artifacts
 * - Remix functionality (restore settings)
 * - Export/Import capabilities
 */
export function ArtifactVault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'chats' | 'workflows'>('all')

  const { artifacts, removeArtifact, clearAll, exportVault, importVault } = useVaultStore()

  // Filter artifacts by type and search query
  const filteredArtifacts = useMemo(() => {
    let filtered = artifacts

    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter((artifact) => {
        if (activeTab === 'images') return artifact.type === 'image'
        if (activeTab === 'chats') return artifact.type === 'chat'
        if (activeTab === 'workflows') return artifact.type === 'workflow'
        return true
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (artifact) =>
          artifact.title.toLowerCase().includes(query) ||
          artifact.description?.toLowerCase().includes(query) ||
          artifact.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [artifacts, activeTab, searchQuery])

  const handleExport = () => {
    exportVault()
  }

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
            console.error('Failed to import vault:', error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getTabIcon = (tab: typeof activeTab) => {
    switch (tab) {
      case 'images':
        return <ImageIcon size={16} weight="fill" />
      case 'chats':
        return <ChatCircle size={16} weight="fill" />
      case 'workflows':
        return <FlowArrow size={16} weight="fill" />
      default:
        return <Vault size={16} weight="fill" />
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
    <div className="module-vault border-primary/30 glass-card corner-accent glow-border flex h-[calc(100vh-280px)] min-h-[600px] flex-col overflow-hidden rounded-lg border-2">
      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b bg-black/70 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="badge-vault font-mono text-xs">
            <Vault size={12} weight="fill" className="mr-1" />
            ARTIFACT_VAULT
          </Badge>
          <span className="text-muted-foreground font-mono text-xs">
            <span className="text-primary">{'>'}</span> HISTORY_STORAGE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="ghost"
            size="sm"
            className="font-mono text-xs uppercase"
          >
            <DownloadSimple size={16} className="mr-1" />
            EXPORT
          </Button>
          <Button
            onClick={handleImport}
            variant="ghost"
            size="sm"
            className="font-mono text-xs uppercase"
          >
            <DownloadSimple size={16} className="mr-1 rotate-180" />
            IMPORT
          </Button>
          <Button
            onClick={clearAll}
            variant="ghost"
            size="sm"
            className="text-destructive font-mono text-xs uppercase"
            disabled={artifacts.length === 0}
          >
            <Trash size={16} className="mr-1" />
            CLEAR_ALL
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-border/50 border-b bg-black/30 p-4">
        <div className="relative">
          <MagnifyingGlass
            size={20}
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artifacts by title, description, or tags..."
            className="pl-10 font-mono text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="border-border/50 border-b bg-black/20 px-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="font-mono text-xs uppercase">
              {getTabIcon('all')}
              <span className="ml-2">ALL ({getTabCount('all')})</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="font-mono text-xs uppercase">
              {getTabIcon('images')}
              <span className="ml-2">IMAGES ({getTabCount('images')})</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="font-mono text-xs uppercase">
              {getTabIcon('chats')}
              <span className="ml-2">CHATS ({getTabCount('chats')})</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="font-mono text-xs uppercase">
              {getTabIcon('workflows')}
              <span className="ml-2">WORKFLOWS ({getTabCount('workflows')})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="m-0 flex-1">
          <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredArtifacts.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full py-12 text-center"
                  >
                    <Vault size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="mb-2 text-lg font-black uppercase">VAULT_EMPTY</h3>
                    <p className="text-muted-foreground font-mono text-xs">
                      {searchQuery ? (
                        <>
                          <span className="text-primary">{'>'}</span> NO_RESULTS_FOR &quot;
                          {searchQuery}&quot;
                        </>
                      ) : (
                        <>
                          <span className="text-primary">{'>'}</span> CREATE_ARTIFACTS_TO_START
                        </>
                      )}
                    </p>
                  </motion.div>
                ) : (
                  filteredArtifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      onRemove={() => removeArtifact(artifact.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useKV } from '@github/spark/hooks'

export type ArtifactType = 'image' | 'chat' | 'workflow'

export type Artifact = {
  id: string
  type: ArtifactType
  title: string
  description?: string
  timestamp: number
  model?: string
  tags?: string[]
  data: Record<string, unknown>
}

/**
 * Vault Store
 *
 * Centralized artifact storage with KV persistence.
 * Stores all generated artifacts (images, chats, workflows).
 */
export function useVaultStore() {
  const [artifacts, setArtifacts] = useKV<Artifact[]>('vault-artifacts', [])

  const addArtifact = (artifact: Omit<Artifact, 'id' | 'timestamp'>) => {
    const newArtifact: Artifact = {
      ...artifact,
      id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    }

    setArtifacts((current) => [newArtifact, ...current])
  }

  const removeArtifact = (id: string) => {
    setArtifacts((current) => current.filter((artifact) => artifact.id !== id))
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all artifacts? This cannot be undone.')) {
      setArtifacts([])
    }
  }

  const exportVault = () => {
    const data = {
      artifacts: artifacts,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aether-vault-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importVault = (data: { artifacts: Artifact[] }) => {
    if (!data.artifacts || !Array.isArray(data.artifacts)) {
      alert("Import failed: missing or invalid 'artifacts' array in vault data")
      return
    }

    const confirmed = confirm(
      `Import ${data.artifacts.length} artifacts? This will add to your existing vault.`
    )

    if (confirmed) {
      setArtifacts([...data.artifacts, ...artifacts])
    }
  }

  return {
    artifacts,
    addArtifact,
    removeArtifact,
    clearAll,
    exportVault,
    importVault,
  }
}

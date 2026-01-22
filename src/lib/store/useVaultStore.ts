import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

type VaultStore = {
  artifacts: Artifact[]
  addArtifact: (artifact: Omit<Artifact, 'id' | 'timestamp'>) => void
  removeArtifact: (id: string) => void
  clearAll: () => void
  exportVault: () => void
  importVault: (data: { artifacts: Artifact[] }) => void
}

/**
 * Vault Store
 *
 * Centralized artifact storage with localStorage persistence.
 * Stores all generated artifacts (images, chats, workflows).
 */
export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      artifacts: [],

      addArtifact: (artifact) => {
        const newArtifact: Artifact = {
          ...artifact,
          id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now(),
        }

        set((state) => ({
          artifacts: [newArtifact, ...state.artifacts],
        }))
      },

      removeArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter((artifact) => artifact.id !== id),
        }))
      },

      clearAll: () => {
        if (confirm('Are you sure you want to clear all artifacts? This cannot be undone.')) {
          set({ artifacts: [] })
        }
      },

      exportVault: () => {
        const data = {
          artifacts: get().artifacts,
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
      },

      importVault: (data) => {
        if (!data.artifacts || !Array.isArray(data.artifacts)) {
          alert('Invalid vault data')
          return
        }

        const confirmed = confirm(
          `Import ${data.artifacts.length} artifacts? This will add to your existing vault.`
        )

        if (confirmed) {
          set((state) => ({
            artifacts: [...data.artifacts, ...state.artifacts],
          }))
        }
      },
    }),
    {
      name: 'aether-vault-storage',
      version: 1,
    }
  )
)

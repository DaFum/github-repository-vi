import { create } from 'zustand'
import type { Artifact } from './useVaultStore'

type ActiveModule = 'synapse' | 'canvas' | 'chat' | 'vault'

type NavigationStore = {
  activeModule: ActiveModule
  pendingArtifact: Artifact | null
  setActiveModule: (module: ActiveModule) => void
  navigateToArtifact: (artifact: Artifact) => void
  clearPendingArtifact: () => void
}

/**
 * Navigation Store
 *
 * Handles module navigation and artifact restoration.
 * Used for "Open" and "Remix" functionality from Vault.
 */
export const useNavigationStore = create<NavigationStore>((set) => ({
  activeModule: 'synapse',
  pendingArtifact: null,

  setActiveModule: (module) => set({ activeModule: module }),

  navigateToArtifact: (artifact) => {
    // Determine target module based on artifact type
    let targetModule: ActiveModule = 'vault'

    switch (artifact.type) {
      case 'image':
        targetModule = 'canvas'
        break
      case 'chat':
        targetModule = 'chat'
        break
      case 'workflow':
        targetModule = 'synapse'
        break
    }

    set({
      activeModule: targetModule,
      pendingArtifact: artifact,
    })
  },

  clearPendingArtifact: () => set({ pendingArtifact: null }),
}))

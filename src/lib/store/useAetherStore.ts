import { create } from 'zustand'
import { pollinations, type TextModel, type ImageModel } from '@/lib/pollinations'

type PollenStatus = 'unknown' | 'empty' | 'low' | 'ok'

type AetherStore = {
  // API Configuration
  apiKey: string | null
  pollenBalance: number | null
  pollenStatus: PollenStatus

  // Available Models
  textModels: TextModel[]
  imageModels: ImageModel[]
  isLoadingModels: boolean

  // Actions
  initialize: () => Promise<void>
  setApiKey: (key: string) => void
  refreshModels: () => Promise<void>
  refreshBalance: () => Promise<void>
}

export const useAetherStore = create<AetherStore>((set, get) => ({
  // Initial State
  apiKey: null,
  pollenBalance: null,
  pollenStatus: 'unknown',
  textModels: [],
  imageModels: [],
  isLoadingModels: false,

  // Initialize: Load API key and fetch models
  initialize: async () => {
    set({ isLoadingModels: true })

    // Load API key from pollinations client
    const key = pollinations.getApiKey()
    set({ apiKey: key })

    // Fetch models in parallel
    try {
      const [textModels, imageModels] = await Promise.all([
        pollinations.getTextModels(),
        pollinations.getImageModels(),
      ])

      set({
        textModels,
        imageModels,
        isLoadingModels: false,
      })

      // Fetch balance if API key exists
      if (key) {
        get().refreshBalance()
      }
    } catch (error) {
      console.error('Failed to initialize Aether Store:', error)
      set({ isLoadingModels: false })
    }
  },

  // Set API Key
  setApiKey: (key: string) => {
    pollinations.setApiKey(key)
    set({ apiKey: key })

    // Refresh models and balance
    get().refreshModels()
    get().refreshBalance()
  },

  // Refresh available models
  refreshModels: async () => {
    set({ isLoadingModels: true })

    try {
      const [textModels, imageModels] = await Promise.all([
        pollinations.getTextModels(),
        pollinations.getImageModels(),
      ])

      set({
        textModels,
        imageModels,
        isLoadingModels: false,
      })
    } catch (error) {
      console.error('Failed to refresh models:', error)
      set({ isLoadingModels: false })
    }
  },

  // Refresh account balance
  refreshBalance: async () => {
    const balance = await pollinations.getBalance()
    set({ pollenBalance: balance })

    // Update status based on balance
    if (balance === null) {
      set({ pollenStatus: 'unknown' })
    } else if (balance === 0) {
      set({ pollenStatus: 'empty' })
    } else if (balance > 0 && balance < 1) {
      set({ pollenStatus: 'low' })
    } else {
      set({ pollenStatus: 'ok' })
    }
  },
}))

export type PollinationsMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type TextModel = {
  name: string
  description: string
  type: 'text' | 'embedding'
  input_modalities?: string[]
  output_modalities?: string[]
  context_length?: number
  capabilities?: ModelCapability[]
}

export type ImageModel = {
  name: string
  description: string
  width?: number
  height?: number
  capabilities?: ModelCapability[]
}

export type ModelCapability = 'vision' | 'audio' | 'video' | 'code' | 'search' | 'reasoning'

import { Lifecycle } from './interfaces'

export type PollinationsOptions = {
  model?: string
  temperature?: number
  jsonMode?: boolean
  seed?: number
}

class PollinationsClient implements Lifecycle {
  private apiKey: string | null = null
  private baseUrl = 'https://gen.pollinations.ai'
  private readonly storageKey = 'aether_api_key'

  constructor() {
    this.initialize()
  }

  async initialize(): Promise<void> {
    // Load API key from localStorage if available
    const storedKey = localStorage.getItem(this.storageKey)
    if (storedKey && storedKey.startsWith('pk_')) {
      this.apiKey = storedKey
    }
  }

  dispose() {
    // No-op for stateless client
  }

  setApiKey(key: string) {
    // Store API key in localStorage for persistence (BYOP)
    if (key && key.startsWith('pk_')) {
      this.apiKey = key
      localStorage.setItem(this.storageKey, key)
    } else {
      this.apiKey = null
      localStorage.removeItem(this.storageKey)
    }
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  /**
   * Fetch available text models from Pollinations API
   */
  async getTextModels(): Promise<TextModel[]> {
    try {
      let url = `${this.baseUrl}/v1/models`
      if (this.apiKey) {
        url += `?key=${this.apiKey}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch text models: ${response.status}`)
      }

      const data = await response.json()
      const models = data.data || []

      // Filter out embedding models
      return models
        .filter((m: TextModel) => m.type !== 'embedding')
        .map((m: TextModel) => ({
          ...m,
          capabilities: this.detectCapabilities(m),
        }))
    } catch (error) {
      console.error('Error fetching text models:', error)
      return []
    }
  }

  /**
   * Fetch available image models from Pollinations API
   */
  async getImageModels(): Promise<ImageModel[]> {
    try {
      let url = `${this.baseUrl}/image/models`
      if (this.apiKey) {
        url += `?key=${this.apiKey}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image models: ${response.status}`)
      }

      const models = await response.json()
      return models.map((m: ImageModel) => ({
        ...m,
        capabilities: this.detectImageCapabilities(m),
      }))
    } catch (error) {
      console.error('Error fetching image models:', error)
      return []
    }
  }

  /**
   * Detect capabilities of a text model based on its properties
   */
  detectCapabilities(model: TextModel): ModelCapability[] {
    const capabilities: ModelCapability[] = []
    const name = model.name.toLowerCase()

    // Video generation
    if (name.includes('veo') || name.includes('seedance') || name.includes('wan')) {
      capabilities.push('video')
    }

    // Vision (multimodal input)
    if (model.input_modalities?.includes('image')) {
      capabilities.push('vision')
    }

    // Audio
    if (model.input_modalities?.includes('audio')) {
      capabilities.push('audio')
    }

    // Code execution (Gemini models)
    if (name.includes('gemini') && !name.includes('search')) {
      capabilities.push('code')
    }

    // Web Search
    if (
      name.includes('gemini-search') ||
      name.includes('perplexity') ||
      name.includes('grok') ||
      name.includes('nomnom')
    ) {
      capabilities.push('search')
    }

    // Reasoning (o1, DeepSeek, etc.)
    if (name.includes('o1') || name.includes('deepseek') || name.includes('reasoning')) {
      capabilities.push('reasoning')
    }

    return capabilities
  }

  /**
   * Detect capabilities of an image model
   */
  detectImageCapabilities(model: ImageModel): ModelCapability[] {
    const capabilities: ModelCapability[] = []
    const name = model.name.toLowerCase()

    // Video generation for image models
    if (name.includes('veo') || name.includes('video')) {
      capabilities.push('video')
    }

    return capabilities
  }

  /**
   * Check account balance (if API key is provided)
   */
  async getBalance(): Promise<number | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const url = `${this.baseUrl}/account/balance?key=${this.apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.balance || 0
    } catch (error) {
      console.error('Error fetching balance:', error)
      return null
    }
  }

  /**
   * The "Cost-Arbitrage" Broker
   * Automatically selects the best model based on prompt complexity.
   *
   * Low Complexity -> openai (Fast/Cheap)
   * High Complexity -> claude-large / gemini-search (Reasoning/Search)
   * Code Generation -> qwen-coder (Specialized)
   */
  smartSelectModel(prompt: string, intent?: 'code' | 'reasoning' | 'creative'): string {
    const complexityScore = this.calculateComplexity(prompt)

    if (
      intent === 'code' ||
      prompt.includes('function') ||
      prompt.includes('class') ||
      prompt.includes('const ')
    ) {
      return 'qwen-coder'
    }

    if (intent === 'reasoning' || complexityScore > 80) {
      return 'gemini-large' // Fallback to a reasoning-capable model
    }

    if (complexityScore > 50) {
      return 'claude' // Mid-tier reasoning
    }

    return 'openai' // Default, fast
  }

  private calculateComplexity(prompt: string): number {
    let score = 0
    // Length factor
    score += Math.min(prompt.length / 50, 40)

    // Keyword factor
    const complexKeywords = [
      'analyze',
      'audit',
      'critique',
      'strategy',
      'architecture',
      'recursive',
      'optimize',
    ]
    complexKeywords.forEach((word) => {
      if (prompt.toLowerCase().includes(word)) score += 10
    })

    // Formatting factor
    if (prompt.includes('```') || prompt.includes('{')) score += 15

    return Math.min(score, 100)
  }

  async chat(messages: PollinationsMessage[], options: PollinationsOptions = {}): Promise<string> {
    let { model } = options
    const { temperature = 0.7, jsonMode = false, seed } = options

    // Auto-select model if not specified, based on the last user message
    if (!model) {
      const lastUserMsg = messages
        .slice()
        .reverse()
        .find((m) => m.role === 'user')
      if (lastUserMsg) {
        model = this.smartSelectModel(lastUserMsg.content)
      } else {
        model = 'openai'
      }
    }

    // Construct URL with key param if available (BYOP)
    let url = `${this.baseUrl}/v1/chat/completions`
    if (this.apiKey) {
      url += `?key=${this.apiKey}&private=true`
    }

    // Construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Construct body
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
      model,
      messages,
      temperature,
      stream: false,
    }

    if (jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    if (seed !== undefined) {
      body.seed = seed
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pollinations API Error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Pollinations Chat Error:', error)
      throw error
    }
  }

  /**
   * Generates an image using Pollinations.ai
   * @param prompt The image description
   * @param options Additional options like model, width, height
   */
  async generateImage(
    prompt: string,
    options: {
      model?: string
      width?: number
      height?: number
      enhance?: boolean
      seed?: number
    } = {}
  ): Promise<string> {
    const { model = 'flux', width = 1024, height = 1024, enhance = false, seed } = options
    const encodedPrompt = encodeURIComponent(prompt)

    // Construct URL with query params
    let url = `${this.baseUrl}/image/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`

    if (enhance) {
      url += '&enhance=true'
    }

    if (seed !== undefined) {
      url += `&seed=${seed}`
    }

    if (this.apiKey) {
      url += `&key=${this.apiKey}&private=true`
    }

    return url
  }
}

export const pollinations = new PollinationsClient()

export const createPollinationsClient = () => new PollinationsClient()

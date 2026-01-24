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
    try {
      const storedKey = localStorage.getItem(this.storageKey)
      if (storedKey && storedKey.startsWith('pk_')) {
        this.apiKey = storedKey
      }
    } catch (error) {
      console.warn('localStorage not available (private mode?):', error)
    }
  }

  dispose() {
    // No-op for stateless client
  }

  setApiKey(key: string) {
    // Store API key in localStorage for persistence (BYOP)
    //
    // SECURITY CONSIDERATION:
    // API keys are stored in plain text in localStorage, which is accessible
    // by any JavaScript running on this origin. This is acceptable for:
    // - Development and prototyping
    // - Personal use applications
    // - Low-sensitivity API keys with usage limits
    //
    // For production applications with sensitive data:
    // - Consider using secure session storage or encrypted storage
    // - Implement proper authentication flow with backend token management
    // - Use API key rotation and rate limiting
    // - Monitor for XSS vulnerabilities that could expose keys
    //
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
      // Use standard endpoint for models list
      // If API key is present, it returns all available models (including premium)
      let url = `${this.baseUrl}/text/models`

      const headers: Record<string, string> = {}
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(url, { headers })
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

  // Capability detection configuration mapping
  private static readonly CAPABILITY_PATTERNS = {
    video: ['veo', 'seedance', 'wan'],
    code: ['gemini'], // Must not include 'search'
    search: ['gemini-search', 'perplexity', 'grok', 'nomnom'],
    reasoning: ['o1', 'deepseek', 'reasoning'],
  } as const

  /**
   * Detect capabilities of a text model based on its properties
   * Prefers explicit model properties (input_modalities) over name-based heuristics
   */
  detectCapabilities(model: TextModel): ModelCapability[] {
    const capabilities: ModelCapability[] = []
    const name = model.name.toLowerCase()

    // Priority 1: Use explicit modality information from API
    if (model.input_modalities?.includes('image')) {
      capabilities.push('vision')
    }

    if (model.input_modalities?.includes('audio')) {
      capabilities.push('audio')
    }

    // Priority 2: Check model capabilities if provided by API
    if (model.capabilities) {
      return [...new Set([...capabilities, ...model.capabilities])]
    }

    // Priority 3: Fallback to name-based heuristics using configuration
    for (const pattern of PollinationsClient.CAPABILITY_PATTERNS.video) {
      if (name.includes(pattern)) {
        capabilities.push('video')
        break
      }
    }

    // Code execution (Gemini models, excluding search variants)
    if (
      PollinationsClient.CAPABILITY_PATTERNS.code.some((p) => name.includes(p)) &&
      !name.includes('search')
    ) {
      capabilities.push('code')
    }

    // Web Search
    if (PollinationsClient.CAPABILITY_PATTERNS.search.some((p) => name.includes(p))) {
      capabilities.push('search')
    }

    // Reasoning
    if (PollinationsClient.CAPABILITY_PATTERNS.reasoning.some((p) => name.includes(p))) {
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
      console.warn('getBalance: No API key configured')
      return null
    }

    try {
      const url = `${this.baseUrl}/account/balance?key=${this.apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        console.error(
          `getBalance: API request failed with status ${response.status} ${response.statusText}`
        )
        return null
      }

      const data = await response.json()
      return data.balance || 0
    } catch (error) {
      console.error('getBalance: Request failed:', error)
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

    // Construct URL
    const url = `${this.baseUrl}/v1/chat/completions`

    // Construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add Bearer token for Auth
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    // Construct body with explicit type
    interface ChatRequestBody {
      model: string
      messages: PollinationsMessage[]
      temperature: number
      stream: boolean
      response_format?: { type: string }
      seed?: number
    }

    const body: ChatRequestBody = {
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
   *
   * NOTE: Image URLs must include API key as query parameter since
   * HTML <img> tags cannot send Authorization headers. Consider this
   * security trade-off when using in production.
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
    // Use dedicated image generation endpoint
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`

    if (enhance) {
      url += '&enhance=true'
    }

    if (seed !== undefined) {
      url += `&seed=${seed}`
    }

    // Image URLs must use query parameter for authentication
    // since <img> tags cannot send Authorization headers
    if (this.apiKey) {
      url += `&key=${this.apiKey}&private=true`
    }

    return url
  }
}

export const pollinations = new PollinationsClient()

export const createPollinationsClient = () => new PollinationsClient()

export type PollinationsMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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

  constructor() {
    this.initialize()
  }

  initialize() {
    // No-op: API key is kept only in memory and not persisted to localStorage
  }

  dispose() {
    // No-op for stateless client
  }

  setApiKey(key: string) {
    // Store API key only in memory; do not persist to localStorage to avoid clear-text storage
    this.apiKey = key
  }

  getApiKey(): string | null {
    return this.apiKey
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

    // Construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
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
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
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
    options: { model?: string; width?: number; height?: number } = {}
  ): Promise<string> {
    const { model = 'flux', width = 1024, height = 1024 } = options
    const encodedPrompt = encodeURIComponent(prompt)

    // Construct URL with query params
    let url = `${this.baseUrl}/image/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`

    if (this.apiKey) {
      url += `&key=${this.apiKey}`
    }

    return url
  }
}

export const pollinations = new PollinationsClient()

export const createPollinationsClient = () => new PollinationsClient()

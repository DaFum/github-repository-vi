import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

interface RefinementPayload {
  content: string
  context: string
}

interface RefinementResult {
  finalContent: string
  iterations: number
  confidence: number
}

export class RefinementAgent implements SpecializedAgent<RefinementPayload, RefinementResult> {
  async execute({ content, context }: RefinementPayload): Promise<RefinementResult> {
    const MAX_ITERATIONS = 3
    let currentDraft = content
    let confidence = 0
    let iterations = 0

    while (iterations < MAX_ITERATIONS && confidence < 90) {
      iterations++

      // 1. Criticize
      const critiqueResponse = await pollinations.chat(
        [
          {
            role: 'system',
            content:
              'You are a strict critic. Rate confidence (0-100) and provide specific feedback.',
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nDraft: ${currentDraft}\n\nProvide JSON: { "confidence": number, "feedback": "string" }`,
          },
        ],
        { model: 'openai', jsonMode: true }
      )

      const critique = JSON.parse(critiqueResponse)
      confidence = critique.confidence

      if (confidence >= 90) break

      // 2. Refine
      const refineResponse = await pollinations.chat(
        [
          {
            role: 'system',
            content: 'You are an expert editor. Improve the draft based on feedback.',
          },
          {
            role: 'user',
            content: `Original: ${currentDraft}\nFeedback: ${critique.feedback}\n\nRewrite the draft.`,
          },
        ],
        { model: 'openai' }
      )

      currentDraft = refineResponse
    }

    return { finalContent: currentDraft, iterations, confidence }
  }
}

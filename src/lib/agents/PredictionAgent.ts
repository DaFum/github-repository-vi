import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

interface PredictionResult {
  score: number
  reasoning: string
}

export class PredictionAgent implements SpecializedAgent<string, PredictionResult> {
  async execute(url: string): Promise<PredictionResult> {
    const promptText = `You are a predictive AI agent. Analyze this URL and predict its potential popularity/click-through rate.

URL: ${url}

Consider factors like domain authority, content type, URL structure, and typical engagement patterns. Return as JSON:
{
  "score": 75,
  "reasoning": "Brief explanation of the prediction"
}

Score should be 0-100 (higher = more likely to be popular).`

    const response = await pollinations.chat(
      [
        {
          role: 'system',
          content: 'You are a viral trend prediction expert. Return strictly valid JSON.',
        },
        { role: 'user', content: promptText },
      ],
      { model: 'openai', jsonMode: true }
    )

    return JSON.parse(response)
  }
}

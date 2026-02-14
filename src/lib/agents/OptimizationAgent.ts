import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

interface OptimizationPayload {
  id: string
  originalUrl: string
  clicks: number
}

interface OptimizationResult {
  recommendations: string[]
  optimizationScore: number
}

/**
 * Agent responsible for providing optimization recommendations for link usage.
 */
export class OptimizationAgent implements SpecializedAgent<
  OptimizationPayload[],
  OptimizationResult
> {
  /**
   * Analyzes link data to provide optimization strategies and a score.
   * @param links Array of link data payloads.
   * @returns Optimization result containing recommendations and a score.
   */
  async execute(links: OptimizationPayload[]): Promise<OptimizationResult> {
    const promptText = `You are an AI optimization agent. Analyze these shortened links and provide strategic recommendations.

Links data:
${JSON.stringify(
  links.map((l) => ({ url: l.originalUrl, clicks: l.clicks })),
  null,
  2
)}

Provide 3-5 actionable recommendations to improve link management, categorization, or usage patterns. Return as a JSON object with this structure:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "optimizationScore": 85
}

The optimizationScore should be 0-100 based on current link organization quality.`

    const response = await pollinations.chat(
      [
        {
          role: 'system',
          content: 'You are a strategic optimization expert. Return strictly valid JSON.',
        },
        { role: 'user', content: promptText },
      ],
      { model: 'openai', jsonMode: true }
    )

    return JSON.parse(response)
  }
}

import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

interface AnalyticsPayload {
  originalUrl: string
  category?: string
  clicks: number
}

interface AnalyticsResult {
  insights: string[]
  trends: string[]
}

/**
 * Agent responsible for analyzing usage patterns and extracting insights.
 */
export class AnalyticsAgent implements SpecializedAgent<AnalyticsPayload[], AnalyticsResult> {
  /**
   * Analyzes link usage data to generate insights and trends.
   * @param links Array of analytics data payloads.
   * @returns Analysis result containing insights and trends.
   */
  async execute(links: AnalyticsPayload[]): Promise<AnalyticsResult> {
    const promptText = `You are an AI analytics agent. Analyze these link usage patterns and extract insights.

Links data:
${JSON.stringify(
  links.map((l) => ({ url: l.originalUrl, category: l.category, clicks: l.clicks })),
  null,
  2
)}

Identify patterns, trends, and insights about the user's link usage. Return as JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "trends": ["trend 1", "trend 2", ...]
}

Focus on actionable intelligence like most used categories, engagement patterns, or content preferences.`

    const response = await pollinations.chat(
      [
        { role: 'system', content: 'You are a data analytics expert. Return strictly valid JSON.' },
        { role: 'user', content: promptText },
      ],
      { model: 'openai', jsonMode: true }
    )

    return JSON.parse(response)
  }
}

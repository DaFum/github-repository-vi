import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

interface AuditResult {
  flaws: string[]
  riskLevel: 'low' | 'medium' | 'high'
  critique: string
}

/**
 * Agent responsible for auditing content for flaws and risks.
 */
export class AuditAgent implements SpecializedAgent<string, AuditResult> {
  /**
   * Audits the provided content for logical fallacies and safety risks.
   * @param content The text content to audit.
   * @returns An audit result containing flaws, risk level, and a critique.
   */
  async execute(content: string): Promise<AuditResult> {
    const prompt = `Audit the following content/plan for logical fallacies, safety risks, and hidden assumptions. Be ruthless.

Content: "${content}"

Return JSON:
{
  "flaws": ["flaw 1", "flaw 2"],
  "riskLevel": "low" | "medium" | "high",
  "critique": "Overall assessment..."
}`

    const response = await pollinations.chat(
      [
        {
          role: 'system',
          content:
            "You are the Devil's Advocate. You challenge assumptions and find critical flaws. You are not polite; you are accurate.",
        },
        { role: 'user', content: prompt },
      ],
      { model: 'claude', jsonMode: true }
    )

    return JSON.parse(response)
  }
}

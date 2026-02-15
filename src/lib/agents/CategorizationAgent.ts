import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

/**
 * Agent responsible for categorizing URLs into predefined categories.
 */
export class CategorizationAgent implements SpecializedAgent<string, string> {
  /**
   * Categorizes a given URL.
   * @param url The URL to categorize.
   * @returns The category name.
   */
  async execute(url: string): Promise<string> {
    const promptText = `Analyze this URL and categorize it into ONE of these categories: Social Media, E-commerce, News, Documentation, Entertainment, Business, Education, Technology, Health, Finance, Travel, Food, Sports, Gaming, Government, or Other.

URL: ${url}

Return ONLY the category name, nothing else.`

    try {
      const category = await pollinations.chat(
        [
          { role: 'system', content: 'You are a precise URL categorization agent.' },
          { role: 'user', content: promptText },
        ],
        { model: 'openai', temperature: 0.1 }
      )

      return category.trim()
    } catch (e) {
      console.warn('CategorizationAgent failed, falling back to heuristic', e)
      return 'Uncategorized'
    }
  }
}

import { pollinations } from '@/lib/pollinations'

export class GeneticPrompt {
  static async evolve(originalPrompt: string, goal: string): Promise<string> {
    const GENERATIONS = 2 // Short evolution for speed
    let currentPool = [originalPrompt]

    for (let gen = 0; gen < GENERATIONS; gen++) {
      console.log(`Genetic Evolution: Generation ${gen + 1}`)

      // 1. Mutate / Generate Variations
      const variations = await this.generateVariations(currentPool[0], goal)

      // 2. Score (Shadow Mode - Simulated)
      // In a real system, we'd run the task and score the output.
      // Here, we ask the "Judge" agent to score the PROMPT quality directly based on heuristics.
      const scored = await Promise.all(
        variations.map(async (p) => ({
          prompt: p,
          score: await this.scorePrompt(p, goal),
        }))
      )

      // 3. Selection (Survival of the Fittest)
      scored.sort((a, b) => b.score - a.score)
      currentPool = scored.slice(0, 2).map((s) => s.prompt)

      // 4. Crossover (Mixing top 2)
      if (currentPool.length > 1) {
        const child = await this.crossover(currentPool[0], currentPool[1])
        currentPool.push(child)
      }
    }

    return currentPool[0] // Best performer
  }

  private static async generateVariations(prompt: string, goal: string): Promise<string[]> {
    const response = await pollinations.chat(
      [
        {
          role: 'system',
          content:
            'You are an Evolutionary Prompt Engineer. Generate 3 distinct mutations of the user prompt that might achieve the goal better. Return strictly valid JSON array of strings.',
        },
        { role: 'user', content: `Prompt: ${prompt}\nGoal: ${goal}\n\nVariations:` },
      ],
      { model: 'openai', jsonMode: true }
    )

    return JSON.parse(response) // Expecting ["var1", "var2", "var3"]
  }

  private static async scorePrompt(prompt: string, goal: string): Promise<number> {
    const response = await pollinations.chat(
      [
        {
          role: 'system',
          content:
            'Score this prompt from 0-100 on its likelihood to achieve the goal. Return strictly valid JSON: { "score": number }.',
        },
        { role: 'user', content: `Prompt: ${prompt}\nGoal: ${goal}` },
      ],
      { model: 'openai', jsonMode: true }
    )

    return JSON.parse(response).score
  }

  private static async crossover(p1: string, p2: string): Promise<string> {
    const response = await pollinations.chat(
      [
        { role: 'system', content: 'Merge these two prompts into a superior hybrid.' },
        { role: 'user', content: `P1: ${p1}\nP2: ${p2}` },
      ],
      { model: 'openai' }
    )
    return response
  }
}

import { SpecializedAgent } from './types'
import { pollinations } from '@/lib/pollinations'

export interface DevelopmentPayload {
  task: string
  context?: string
}

export interface DevelopmentResult {
  success: boolean
  code: string
  iterations: number
  logs: string[]
}

export class DevelopmentAgent implements SpecializedAgent<DevelopmentPayload, DevelopmentResult> {
  private MAX_ITERATIONS = 5

  async execute(payload: DevelopmentPayload): Promise<DevelopmentResult> {
    const { task, context = '' } = payload
    let currentCode = ''
    let feedback = ''
    const logs: string[] = []

    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      logs.push(`Iteration ${i + 1}/${this.MAX_ITERATIONS}`)

      // 1. Implementation
      logs.push('Phase 1: Implementation')
      currentCode = await this.implement(task, context, currentCode, feedback)
      logs.push('Implementation complete')

      // 2. Spec Review
      logs.push('Phase 2: Spec Review')
      const specReview = await this.reviewSpec(task, currentCode)
      if (!specReview.approved) {
        feedback = `Spec Review Failed: ${specReview.feedback}`
        logs.push(feedback)
        continue // Loop back to implementation
      }
      logs.push('Spec Review Passed')

      // 3. Quality Review
      logs.push('Phase 3: Quality Review')
      const qualityReview = await this.reviewQuality(currentCode)
      if (!qualityReview.approved) {
        feedback = `Quality Review Failed: ${qualityReview.feedback}`
        logs.push(feedback)
        continue // Loop back to implementation
      }
      logs.push('Quality Review Passed')

      // If we get here, both reviews passed
      return {
        success: true,
        code: currentCode,
        iterations: i + 1,
        logs,
      }
    }

    return {
      success: false,
      code: currentCode,
      iterations: this.MAX_ITERATIONS,
      logs: [...logs, 'Max iterations reached'],
    }
  }

  private async implement(
    task: string,
    context: string,
    previousCode: string,
    feedback: string
  ): Promise<string> {
    const prompt = `
You are an Expert Developer.
Task: ${task}
Context: ${context}

${
  previousCode
    ? `Previous Code:\n${previousCode}\n\nFeedback to fix:\n${feedback}`
    : 'Please implement this task.'
}

Output ONLY the code. No markdown code blocks, just the code.
`
    return await pollinations.chat(
      [
        { role: 'system', content: 'You are a senior developer.' },
        { role: 'user', content: prompt },
      ],
      { model: 'qwen-coder' } // Use coding model
    )
  }

  private async reviewSpec(
    task: string,
    code: string
  ): Promise<{ approved: boolean; feedback: string }> {
    const prompt = `
You are a Spec Reviewer.
Task: ${task}

Code to review:
${code}

Does the code meet the spec?
Return JSON: { "approved": boolean, "feedback": "string" }
`
    try {
      const response = await pollinations.chat(
        [
          { role: 'system', content: 'You are a ruthless spec reviewer.' },
          { role: 'user', content: prompt },
        ],
        { model: 'claude', jsonMode: true }
      )
      return JSON.parse(response)
    } catch (e) {
      console.error('Spec review parse error', e)
      return { approved: false, feedback: 'Review failed to parse' }
    }
  }

  private async reviewQuality(code: string): Promise<{ approved: boolean; feedback: string }> {
    const prompt = `
You are a Code Quality Reviewer.

Code to review:
${code}

Is the code high quality (clean, readable, safe)?
Return JSON: { "approved": boolean, "feedback": "string" }
`
    try {
      const response = await pollinations.chat(
        [
          { role: 'system', content: 'You are a code quality expert.' },
          { role: 'user', content: prompt },
        ],
        { model: 'claude', jsonMode: true }
      )
      return JSON.parse(response)
    } catch (e) {
      console.error('Quality review parse error', e)
      return { approved: false, feedback: 'Review failed to parse' }
    }
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DevelopmentAgent } from './DevelopmentAgent'
import { pollinations } from '@/lib/pollinations'

vi.mock('@/lib/pollinations', () => ({
  pollinations: {
    chat: vi.fn(),
  },
}))

describe('DevelopmentAgent', () => {
  let agent: DevelopmentAgent

  beforeEach(() => {
    agent = new DevelopmentAgent()
    vi.clearAllMocks()
  })

  it('should successfully complete the workflow when all reviews pass', async () => {
    // Mock responses:
    // 1. Implementation
    // 2. Spec Review (Pass)
    // 3. Quality Review (Pass)
    vi.mocked(pollinations.chat)
      .mockResolvedValueOnce('const x = 1;') // Implementation
      .mockResolvedValueOnce(JSON.stringify({ approved: true, feedback: 'Good' })) // Spec Review
      .mockResolvedValueOnce(JSON.stringify({ approved: true, feedback: 'Great' })) // Quality Review

    const result = await agent.execute({ task: 'Write x' })

    expect(result.success).toBe(true)
    expect(result.code).toBe('const x = 1;')
    expect(result.iterations).toBe(1)
    expect(pollinations.chat).toHaveBeenCalledTimes(3)
  })

  it('should retry when spec review fails', async () => {
    // Mock responses:
    // 1. Implementation 1
    // 2. Spec Review 1 (Fail)
    // 3. Implementation 2 (Fix)
    // 4. Spec Review 2 (Pass)
    // 5. Quality Review (Pass)
    vi.mocked(pollinations.chat)
      .mockResolvedValueOnce('bad code') // Implementation 1
      .mockResolvedValueOnce(JSON.stringify({ approved: false, feedback: 'Missing x' })) // Spec Review 1
      .mockResolvedValueOnce('fixed code') // Implementation 2
      .mockResolvedValueOnce(JSON.stringify({ approved: true, feedback: 'Good' })) // Spec Review 2
      .mockResolvedValueOnce(JSON.stringify({ approved: true, feedback: 'Great' })) // Quality Review

    const result = await agent.execute({ task: 'Write x' })

    expect(result.success).toBe(true)
    expect(result.code).toBe('fixed code')
    expect(result.iterations).toBe(2)
    expect(pollinations.chat).toHaveBeenCalledTimes(5)
  })

  it('should fail after max iterations', async () => {
    // Mock loop of failures
    vi.mocked(pollinations.chat).mockImplementation(async (messages, options) => {
      const prompt = messages[messages.length - 1].content
      if (prompt.includes('Spec Reviewer')) {
        return JSON.stringify({ approved: false, feedback: 'Never good enough' })
      }
      return 'code'
    })

    const result = await agent.execute({ task: 'Impossible task' })

    expect(result.success).toBe(false)
    expect(result.iterations).toBe(5)
    expect(result.logs).toContain('Max iterations reached')
  })
})

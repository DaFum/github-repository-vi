import { describe, it, expect } from 'vitest'
import { TimeAgent } from './TimeAgent'

describe('TimeAgent', () => {
  it('should return formatted time for valid timezone', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute('UTC')
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('should return formatted time for different timezone', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute('America/New_York')
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('should handle invalid timezone gracefully', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute('Invalid/Timezone')
    expect(result).toBe("Error: Invalid timezone 'Invalid/Timezone'")
  })
})

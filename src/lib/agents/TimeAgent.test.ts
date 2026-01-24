import { describe, it, expect } from 'vitest'
import { TimeAgent } from './TimeAgent'

describe('TimeAgent', () => {
  it('should return formatted time for valid timezone (default 24h)', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute({ timezone: 'UTC' })
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/) // 24h default
  })

  it('should return 12h format when requested', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute({ timezone: 'UTC', format: '12h' })
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/)
  })

  it('should handle invalid timezone gracefully', async () => {
    const agent = new TimeAgent()
    const result = await agent.execute({ timezone: 'Invalid/Timezone' })
    expect(result).toBe("Error: Invalid timezone 'Invalid/Timezone'")
  })
})

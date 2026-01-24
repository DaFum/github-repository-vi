import { SpecializedAgent } from './types'

export interface TimeAgentPayload {
  timezone: string
  format?: '12h' | '24h'
}

export class TimeAgent implements SpecializedAgent<TimeAgentPayload, string> {
  async execute(payload: TimeAgentPayload): Promise<string> {
    const { timezone, format = '24h' } = payload
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: format === '12h',
      }
      return new Intl.DateTimeFormat('en-US', options).format(new Date())
    } catch (error) {
      return `Error: Invalid timezone '${timezone}'`
    }
  }
}

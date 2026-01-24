import { SpecializedAgent } from './types'

export class TimeAgent implements SpecializedAgent<string, string> {
  async execute(timezone: string): Promise<string> {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }
      return new Intl.DateTimeFormat('en-US', options).format(new Date())
    } catch (error) {
      return `Error: Invalid timezone '${timezone}'`
    }
  }
}

import { SpecializedAgent } from './types'

export class HealthCheckAgent implements SpecializedAgent<
  string,
  { status: 'healthy' | 'unknown'; timestamp: number }
> {
  async execute(url: string): Promise<{ status: 'healthy' | 'unknown'; timestamp: number }> {
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return { status: 'healthy', timestamp: Date.now() }
    } catch {
      return { status: 'unknown', timestamp: Date.now() }
    }
  }
}

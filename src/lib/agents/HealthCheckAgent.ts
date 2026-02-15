import { SpecializedAgent } from './types'

/**
 * Agent responsible for checking the health status of a URL.
 */
export class HealthCheckAgent implements SpecializedAgent<
  string,
  { status: 'healthy' | 'unknown'; timestamp: number }
> {
  /**
   * Checks if a URL is reachable.
   * @param url The URL to check.
   * @returns The health status and timestamp.
   */
  async execute(url: string): Promise<{ status: 'healthy' | 'unknown'; timestamp: number }> {
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return { status: 'healthy', timestamp: Date.now() }
    } catch {
      return { status: 'unknown', timestamp: Date.now() }
    }
  }
}

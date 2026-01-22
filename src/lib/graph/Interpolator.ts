import { z } from 'zod'

export class Interpolator {
  /**
   * Recursively scans the input object for string placeholders like `{{some.variable}}`
   * and replaces them with data from the source.
   */
  static hydrate(template: unknown, source: Record<string, unknown>): unknown {
    if (typeof template === 'string') {
      return this.interpolateString(template, source)
    } else if (Array.isArray(template)) {
      return template.map((item) => this.hydrate(item, source))
    } else if (typeof template === 'object' && template !== null) {
      const result: Record<string, unknown> = {}
      for (const key in template) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = this.hydrate((template as any)[key], source)
      }
      return result
    }
    return template
  }

  private static interpolateString(str: string, source: Record<string, unknown>): unknown {
    // Regex to match {{variable}}
    const match = str.match(/^{{([^}]+)}}$/)
    if (match) {
      // If the string is EXACTLY the placeholder, return the raw value (preserving type)
      const path = match[1].trim()
      return this.getValueByPath(source, path)
    }

    // Otherwise, replace occurrences within the string (result is always string)
    return str.replace(/{{([^}]+)}}/g, (_, path) => {
      const val = this.getValueByPath(source, path.trim())
      return val !== undefined ? String(val) : ''
    })
  }

  private static getValueByPath(obj: unknown, path: string): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return path.split('.').reduce((acc, part) => acc && (acc as any)[part], obj)
  }

  /**
   * Validates data against a Zod schema and attempts safe coercion.
   */
  static validateAndCoerce(
    data: unknown,
    schema: z.ZodType<unknown>
  ): { success: boolean; data?: unknown; error?: string } {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    }

    // Auto-Coercion Logic
    // 1. String to Array (CSV)
    if (schema instanceof z.ZodArray && typeof data === 'string') {
      try {
        // Try parsing as JSON array first
        if (data.trim().startsWith('[')) {
          const parsed = JSON.parse(data)
          const retry = schema.safeParse(parsed)
          if (retry.success) return { success: true, data: retry.data }
        }
        // Fallback to CSV split
        const parts = data.split(',').map((s) => s.trim())
        const retry = schema.safeParse(parts)
        if (retry.success) return { success: true, data: retry.data }
      } catch {
        // Ignore parse errors, proceed to failure
      }
    }

    // 2. String to Number
    if (schema instanceof z.ZodNumber && typeof data === 'string') {
      const num = parseFloat(data)
      if (!isNaN(num)) {
        return { success: true, data: num }
      }
    }

    return { success: false, error: result.error.toString() }
  }
}

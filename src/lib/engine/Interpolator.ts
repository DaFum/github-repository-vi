import { z } from 'zod'
import type {
  ExecutionContext,
  InterpolationResult,
  InterpolationError,
  ValidationResult,
} from './types'

/**
 * The "Universal Translator"
 *
 * Handles dynamic variable interpolation, type coercion, and schema validation.
 * Eliminates the need for manual data formatting between nodes.
 */
export class Interpolator {
  private static readonly PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g
  private static readonly PATH_SEPARATOR = '.'

  /**
   * Recursively interpolate all placeholders in a value
   *
   * Supports:
   * - {{NodeID.output}} - Reference node outputs
   * - {{$env.API_KEY}} - Environment variables
   * - {{$global.variable}} - Global memory
   */
  static interpolate(value: unknown, context: ExecutionContext): InterpolationResult {
    const errors: InterpolationError[] = []
    const dependencies: string[] = []

    try {
      const result = this.interpolateRecursive(value, context, errors, dependencies)

      return {
        value: result,
        success: errors.length === 0,
        errors,
        dependencies: Array.from(new Set(dependencies)),
      }
    } catch (error) {
      errors.push({
        path: 'root',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'syntax_error',
      })

      return {
        value,
        success: false,
        errors,
        dependencies,
      }
    }
  }

  /**
   * Recursive interpolation logic
   */
  private static interpolateRecursive(
    value: unknown,
    context: ExecutionContext,
    errors: InterpolationError[],
    dependencies: string[]
  ): unknown {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return value
    }

    // Handle strings (placeholder substitution)
    if (typeof value === 'string') {
      return this.interpolateString(value, context, errors, dependencies)
    }

    // Handle arrays (recursive)
    if (Array.isArray(value)) {
      return value.map((item) => this.interpolateRecursive(item, context, errors, dependencies))
    }

    // Handle objects (recursive)
    if (typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.interpolateRecursive(val, context, errors, dependencies)
      }
      return result
    }

    // Primitives pass through
    return value
  }

  /**
   * Interpolate a string with placeholders
   */
  private static interpolateString(
    str: string,
    context: ExecutionContext,
    errors: InterpolationError[],
    dependencies: string[]
  ): unknown {
    const placeholders = Array.from(str.matchAll(this.PLACEHOLDER_REGEX))

    // No placeholders - return as-is
    if (placeholders.length === 0) {
      return str
    }

    // Single placeholder that spans entire string - return the raw value
    if (placeholders.length === 1 && str === `{{${placeholders[0][1]}}}`) {
      const path = placeholders[0][1].trim()
      return this.resolvePath(path, context, errors, dependencies)
    }

    // Multiple placeholders or partial string - perform string replacement
    let result = str
    for (const match of placeholders) {
      const placeholder = match[0] // Full match: {{...}}
      const path = match[1].trim() // Path inside brackets

      const resolved = this.resolvePath(path, context, errors, dependencies)

      // Convert to string for replacement
      const replacement = resolved !== null && resolved !== undefined ? String(resolved) : ''
      result = result.replace(placeholder, replacement)
    }

    return result
  }

  /**
   * Resolve a path like "NodeID.output" or "$env.API_KEY"
   */
  private static resolvePath(
    path: string,
    context: ExecutionContext,
    errors: InterpolationError[],
    dependencies: string[]
  ): unknown {
    const parts = path.split(this.PATH_SEPARATOR)

    // Special paths
    if (parts[0] === '$env') {
      return this.resolveEnvironment(parts.slice(1), context, errors)
    }

    if (parts[0] === '$global') {
      return this.resolveGlobal(parts.slice(1), context, errors)
    }

    // Node reference: "NodeID.output" or "NodeID.output.nested.field"
    const nodeId = parts[0]
    const field = parts[1] || 'output'

    dependencies.push(nodeId)

    const nodeState = context.nodeStates.get(nodeId)

    if (!nodeState) {
      errors.push({
        path,
        message: `Node "${nodeId}" not found in execution context`,
        type: 'missing_dependency',
      })
      return undefined
    }

    if (nodeState.status !== 'completed') {
      errors.push({
        path,
        message: `Node "${nodeId}" has not completed yet (status: ${nodeState.status})`,
        type: 'missing_dependency',
      })
      return undefined
    }

    // Access the field
    let value: unknown = field === 'output' ? nodeState.output : (nodeState as never)[field]

    // Handle nested paths (e.g., "NodeID.output.user.name")
    if (parts.length > 2) {
      for (let i = 2; i < parts.length; i++) {
        if (value === null || value === undefined) {
          errors.push({
            path,
            message: `Cannot access "${parts[i]}" on null/undefined value`,
            type: 'missing_dependency',
          })
          return undefined
        }

        if (typeof value === 'object' && parts[i] in (value as object)) {
          value = (value as Record<string, unknown>)[parts[i]]
        } else {
          errors.push({
            path,
            message: `Field "${parts[i]}" does not exist`,
            type: 'missing_dependency',
          })
          return undefined
        }
      }
    }

    return value
  }

  /**
   * Resolve environment variables
   */
  private static resolveEnvironment(
    path: string[],
    context: ExecutionContext,
    errors: InterpolationError[]
  ): unknown {
    if (path.length === 0) {
      errors.push({
        path: '$env',
        message: 'Environment path is empty',
        type: 'syntax_error',
      })
      return undefined
    }

    const key = path[0]
    const value = context.environment.get(key)

    if (value === undefined) {
      errors.push({
        path: `$env.${key}`,
        message: `Environment variable "${key}" not found`,
        type: 'missing_dependency',
      })
      return undefined
    }

    // Handle nested paths
    if (path.length > 1) {
      let current: unknown = value
      for (let i = 1; i < path.length; i++) {
        if (current === null || current === undefined) {
          return undefined
        }
        if (typeof current === 'object' && path[i] in (current as object)) {
          current = (current as Record<string, unknown>)[path[i]]
        } else {
          return undefined
        }
      }
      return current
    }

    return value
  }

  /**
   * Resolve global memory variables
   */
  private static resolveGlobal(
    path: string[],
    context: ExecutionContext,
    errors: InterpolationError[]
  ): unknown {
    if (path.length === 0) {
      errors.push({
        path: '$global',
        message: 'Global path is empty',
        type: 'syntax_error',
      })
      return undefined
    }

    const key = path[0]
    const value = context.memory.get(key)

    if (value === undefined) {
      errors.push({
        path: `$global.${key}`,
        message: `Global variable "${key}" not found`,
        type: 'missing_dependency',
      })
      return undefined
    }

    // Handle nested paths
    if (path.length > 1) {
      let current: unknown = value
      for (let i = 1; i < path.length; i++) {
        if (current === null || current === undefined) {
          return undefined
        }
        if (typeof current === 'object' && path[i] in (current as object)) {
          current = (current as Record<string, unknown>)[path[i]]
        } else {
          return undefined
        }
      }
      return current
    }

    return value
  }

  /**
   * Type-aware data coercion
   *
   * Automatically converts data to match expected schema:
   * - CSV string -> Array
   * - JSON string -> Object
   * - String number -> Number
   */
  static coerce(value: unknown, targetSchema: z.ZodTypeAny): unknown {
    // If value is already valid, return as-is
    const validation = targetSchema.safeParse(value)
    if (validation.success) {
      return value
    }

    // Try intelligent coercion based on target type
    const schemaType = targetSchema._def.typeName

    switch (schemaType) {
      case 'ZodArray':
        return this.coerceToArray(value)

      case 'ZodObject':
        return this.coerceToObject(value)

      case 'ZodNumber':
        return this.coerceToNumber(value)

      case 'ZodBoolean':
        return this.coerceToBoolean(value)

      default:
        return value
    }
  }

  /**
   * Coerce to array
   */
  private static coerceToArray(value: unknown): unknown {
    if (Array.isArray(value)) return value

    if (typeof value === 'string') {
      // Try CSV parsing
      if (value.includes(',')) {
        return value.split(',').map((v) => v.trim())
      }

      // Try JSON parsing
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed
      } catch {
        // Not JSON
      }

      // Single-item array
      return [value]
    }

    // Wrap in array
    return [value]
  }

  /**
   * Coerce to object
   */
  private static coerceToObject(value: unknown): unknown {
    if (typeof value === 'object' && value !== null) return value

    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    }

    return {}
  }

  /**
   * Coerce to number
   */
  private static coerceToNumber(value: unknown): unknown {
    if (typeof value === 'number') return value

    if (typeof value === 'string') {
      const num = Number(value)
      if (!isNaN(num)) return num
    }

    return 0
  }

  /**
   * Coerce to boolean
   */
  private static coerceToBoolean(value: unknown): unknown {
    if (typeof value === 'boolean') return value

    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      if (lower === 'true' || lower === '1' || lower === 'yes') return true
      if (lower === 'false' || lower === '0' || lower === 'no') return false
    }

    return Boolean(value)
  }

  /**
   * Validate data against a Zod schema with JIT validation
   */
  static validate(value: unknown, schema: z.ZodTypeAny): ValidationResult {
    const result = schema.safeParse(value)

    if (result.success) {
      return {
        valid: true,
        errors: [],
        transformed: result.data,
      }
    }

    return {
      valid: false,
      errors: result.error.issues,
    }
  }

  /**
   * Full pipeline: Interpolate -> Coerce -> Validate
   */
  static process(
    value: unknown,
    schema: z.ZodTypeAny,
    context: ExecutionContext
  ): InterpolationResult & ValidationResult {
    // Step 1: Interpolate
    const interpolated = this.interpolate(value, context)

    if (!interpolated.success) {
      return {
        ...interpolated,
        valid: false,
        errors: [],
      }
    }

    // Step 2: Coerce
    const coerced = this.coerce(interpolated.value, schema)

    // Step 3: Validate
    const validated = this.validate(coerced, schema)

    return {
      value: validated.transformed || coerced,
      success: interpolated.success && validated.valid,
      errors: interpolated.errors,
      dependencies: interpolated.dependencies,
      valid: validated.valid,
      transformed: validated.transformed,
    }
  }
}

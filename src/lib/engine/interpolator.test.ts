import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { Interpolator } from './Interpolator'
import type { ExecutionContext, NodeExecutionState } from './types'

describe('Interpolator', () => {
  // Helper to create a mock execution context
  const createContext = (): ExecutionContext => {
    const context: ExecutionContext = {
      runId: 'test-run',
      status: 'running',
      memory: new Map(),
      nodeStates: new Map(),
      edgeSignals: new Map(),
      history: [],
      environment: new Map(),
    }

    // Add a completed node
    const node1: NodeExecutionState = {
      id: 'node1',
      status: 'completed',
      inputBuffer: {},
      output: { message: 'Hello World', count: 42 },
      error: null,
      startTime: Date.now(),
      endTime: Date.now(),
      logs: [],
      retryCount: 0,
      executionVersion: 1,
    }

    context.nodeStates.set('node1', node1)
    context.environment.set('API_KEY', 'sk-test-123')
    context.memory.set('userName', 'Alice')

    return context
  }

  describe('interpolate', () => {
    it('should interpolate node output', () => {
      const context = createContext()
      const result = Interpolator.interpolate('{{node1.output.message}}', context)

      expect(result.success).toBe(true)
      expect(result.value).toBe('Hello World')
      expect(result.dependencies).toContain('node1')
    })

    it('should interpolate environment variables', () => {
      const context = createContext()
      const result = Interpolator.interpolate('{{$env.API_KEY}}', context)

      expect(result.success).toBe(true)
      expect(result.value).toBe('sk-test-123')
    })

    it('should interpolate global memory', () => {
      const context = createContext()
      const result = Interpolator.interpolate('{{$global.userName}}', context)

      expect(result.success).toBe(true)
      expect(result.value).toBe('Alice')
    })

    it('should handle string templates with multiple placeholders', () => {
      const context = createContext()
      const result = Interpolator.interpolate(
        'User: {{$global.userName}}, Message: {{node1.output.message}}',
        context
      )

      expect(result.success).toBe(true)
      expect(result.value).toBe('User: Alice, Message: Hello World')
    })

    it('should return error for missing dependency', () => {
      const context = createContext()
      const result = Interpolator.interpolate('{{node2.output}}', context)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('missing_dependency')
    })

    it('should recursively interpolate objects', () => {
      const context = createContext()
      const input = {
        user: '{{$global.userName}}',
        apiKey: '{{$env.API_KEY}}',
        data: {
          nested: '{{node1.output.count}}',
        },
      }

      const result = Interpolator.interpolate(input, context)

      expect(result.success).toBe(true)
      expect(result.value).toEqual({
        user: 'Alice',
        apiKey: 'sk-test-123',
        data: {
          nested: 42,
        },
      })
    })
  })

  describe('coerce', () => {
    it('should coerce CSV string to array', () => {
      const schema = z.array(z.string())
      const result = Interpolator.coerce('apple,banana,cherry', schema)

      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should coerce JSON string to object', () => {
      const schema = z.object({ name: z.string() })
      const result = Interpolator.coerce('{"name":"Alice"}', schema)

      expect(result).toEqual({ name: 'Alice' })
    })

    it('should coerce string to number', () => {
      const schema = z.number()
      const result = Interpolator.coerce('42', schema)

      expect(result).toBe(42)
    })

    it('should coerce string to boolean', () => {
      const schema = z.boolean()
      expect(Interpolator.coerce('true', schema)).toBe(true)
      expect(Interpolator.coerce('false', schema)).toBe(false)
      expect(Interpolator.coerce('1', schema)).toBe(true)
      expect(Interpolator.coerce('0', schema)).toBe(false)
    })
  })

  describe('validate', () => {
    it('should validate correct data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const result = Interpolator.validate({ name: 'Alice', age: 30 }, schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const result = Interpolator.validate({ name: 'Alice', age: 'thirty' }, schema)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('process (full pipeline)', () => {
    it('should process interpolation, coercion, and validation', () => {
      const context = createContext()
      const schema = z.number()

      const result = Interpolator.process('{{node1.output.count}}', schema, context)

      expect(result.success).toBe(true)
      expect(result.valid).toBe(true)
      expect(result.value).toBe(42)
    })
  })
})

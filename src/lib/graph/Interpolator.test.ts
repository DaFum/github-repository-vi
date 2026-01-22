import { describe, it, expect } from 'vitest'
import { Interpolator } from './Interpolator'
import { z } from 'zod'

describe('Interpolator', () => {
  describe('hydrate', () => {
    it('should replace simple placeholders', () => {
      const template = { message: 'Hello {{name}}!' }
      const context = { name: 'World' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Hello World!' })
    })

    it('should replace multiple placeholders', () => {
      const template = { message: '{{greeting}} {{name}}, welcome to {{place}}!' }
      const context = { greeting: 'Hello', name: 'Alice', place: 'Wonderland' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Hello Alice, welcome to Wonderland!' })
    })

    it('should handle nested objects', () => {
      const template = {
        user: { name: '{{userName}}', id: '{{userId}}' },
        message: 'Welcome {{userName}}',
      }
      const context = { userName: 'Bob', userId: 123 }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({
        user: { name: 'Bob', id: 123 }, // userId preserves type when exact match
        message: 'Welcome Bob',
      })
    })

    it('should handle arrays', () => {
      const template = ['{{item1}}', '{{item2}}', '{{item3}}']
      const context = { item1: 'A', item2: 'B', item3: 'C' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual(['A', 'B', 'C'])
    })

    it('should leave non-placeholder strings unchanged', () => {
      const template = { message: 'Hello World' }
      const context = { name: 'Alice' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Hello World' })
    })

    it('should handle missing context values', () => {
      const template = { message: 'Hello {{name}}!' }
      const context = {}

      const result = Interpolator.hydrate(template, context)

      // Missing placeholders are replaced with empty string
      expect(result).toEqual({ message: 'Hello !' })
    })

    it('should handle non-string values in context', () => {
      const template = { count: '{{number}}', active: '{{bool}}' }
      const context = { number: 42, bool: true }

      const result = Interpolator.hydrate(template, context)

      // Exact placeholders preserve type
      expect(result).toEqual({ count: 42, active: true })
    })

    it('should handle deeply nested structures', () => {
      const template = {
        level1: {
          level2: {
            level3: {
              value: '{{deepValue}}',
            },
          },
        },
      }
      const context = { deepValue: 'found' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'found',
            },
          },
        },
      })
    })

    it('should handle self-referential context', () => {
      const template = { message: '{{greeting}}' }
      const context = { greeting: 'Hello', message: 'World' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Hello' })
    })
  })

  describe('validateAndCoerce', () => {
    it('should validate data against schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const data = { name: 'Alice', age: 30 }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ name: 'Alice', age: 30 })
      }
    })

    it('should return error for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const data = { name: 'Alice', age: 'thirty' }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })

    it('should coerce string to number', () => {
      const schema = z.number()

      const data = '42'

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(42)
      }
    })

    it('should handle optional fields', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      })

      const data = { name: 'Bob' }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Bob')
        expect(result.data.age).toBeUndefined()
      }
    })

    it('should handle nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      })

      const data = {
        user: {
          name: 'Alice',
          email: 'alice@example.com',
        },
      }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.user.name).toBe('Alice')
        expect(result.data.user.email).toBe('alice@example.com')
      }
    })

    it('should reject invalid email format', () => {
      const schema = z.object({
        email: z.string().email(),
      })

      const data = { email: 'not-an-email' }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(false)
    })

    it('should handle array validation', () => {
      const schema = z.object({
        tags: z.array(z.string()),
      })

      const data = { tags: ['tag1', 'tag2', 'tag3'] }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toHaveLength(3)
      }
    })

    it('should provide detailed error messages', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0).max(150),
      })

      const data = { name: 'Alice', age: 200 }

      const result = Interpolator.validateAndCoerce(data, schema)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('age')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const template = { value: null }
      const context = { key: 'value' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ value: null })
    })

    it('should handle undefined values', () => {
      const template = { value: undefined }
      const context = { key: 'value' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ value: undefined })
    })

    it('should handle empty strings', () => {
      const template = { message: '' }
      const context = { name: 'Alice' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: '' })
    })

    it('should handle empty objects', () => {
      const template = {}
      const context = { key: 'value' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({})
    })

    it('should handle empty arrays', () => {
      const template: unknown[] = []
      const context = { key: 'value' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual([])
    })

    it('should handle placeholders with special characters', () => {
      const template = { message: 'Hello {{user-name}}!' }
      const context = { 'user-name': 'Alice' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Hello Alice!' })
    })

    it('should handle numeric keys in context', () => {
      const template = { message: 'Item {{0}}' }
      const context = { 0: 'first' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: 'Item first' })
    })

    it('should handle multiple placeholders in same string', () => {
      const template = { message: '{{a}} and {{b}} and {{c}}' }
      const context = { a: '1', b: '2', c: '3' }

      const result = Interpolator.hydrate(template, context)

      expect(result).toEqual({ message: '1 and 2 and 3' })
    })
  })
})

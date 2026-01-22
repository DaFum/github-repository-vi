import type { NodeContract, NodeProcessor, NodeDefinition, NodeFactory } from './NodeContract'

/**
 * The Dynamic Node Registry
 *
 * Manages all available node types and enables hot-swapping.
 * Nodes can be registered at runtime, allowing for:
 * - MCP server dynamic generation
 * - Plugin systems
 * - Custom user nodes
 */
export class NodeRegistry {
  private static instance: NodeRegistry
  private definitions = new Map<string, NodeDefinition>()
  private factories = new Map<string, NodeFactory>()
  private listeners = new Set<() => void>()

  private constructor() {
    // Singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry()
    }
    return NodeRegistry.instance
  }

  /**
   * Register a new node type
   *
   * @param definition - Complete node definition (contract + processor)
   * @param factory - Optional factory function for creating new processor instances
   */
  register<TInput = unknown, TOutput = unknown>(
    definition: NodeDefinition<TInput, TOutput>,
    factory?: NodeFactory<TInput, TOutput>
  ): void {
    const type = definition.contract.type

    if (this.definitions.has(type)) {
      console.warn(`Node type "${type}" is already registered. Overwriting...`)
    }

    this.definitions.set(type, definition as NodeDefinition)

    if (factory) {
      this.factories.set(type, factory as NodeFactory)
    }

    // Notify listeners of registry change
    this.notifyListeners()
  }

  /**
   * Unregister a node type
   */
  unregister(type: string): boolean {
    const deleted = this.definitions.delete(type)
    this.factories.delete(type)

    if (deleted) {
      this.notifyListeners()
    }

    return deleted
  }

  /**
   * Get a node definition by type
   */
  get(type: string): NodeDefinition | undefined {
    return this.definitions.get(type)
  }

  /**
   * Get a node contract by type
   */
  getContract(type: string): NodeContract | undefined {
    return this.definitions.get(type)?.contract
  }

  /**
   * Get a node processor by type
   */
  getProcessor(type: string): NodeProcessor | undefined {
    const definition = this.definitions.get(type)
    if (!definition) return undefined

    // If a factory exists, create a new instance
    const factory = this.factories.get(type)
    if (factory) {
      return factory()
    }

    // Otherwise, return the processor from the definition
    return definition.processor
  }

  /**
   * Get all registered node types
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.definitions.values())
  }

  /**
   * Get all node types by category
   */
  getByCategory(category: NodeContract['category']): NodeDefinition[] {
    return this.getAll().filter((def) => def.contract.category === category)
  }

  /**
   * Check if a node type is registered
   */
  has(type: string): boolean {
    return this.definitions.has(type)
  }

  /**
   * Get the total number of registered nodes
   */
  get size(): number {
    return this.definitions.size
  }

  /**
   * Clear all registered nodes
   */
  clear(): void {
    this.definitions.clear()
    this.factories.clear()
    this.notifyListeners()
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of a change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (error) {
        console.error('Error in registry listener:', error)
      }
    })
  }

  /**
   * Bulk register multiple nodes
   */
  registerBulk(definitions: NodeDefinition[]): void {
    definitions.forEach((def) => this.register(def))
  }

  /**
   * Export all registered nodes to JSON
   * (useful for debugging or persistence)
   */
  export(): Array<{ type: string; name: string; category: string }> {
    return this.getAll().map((def) => ({
      type: def.contract.type,
      name: def.contract.name,
      category: def.contract.category,
    }))
  }

  /**
   * Search nodes by name or description
   */
  search(query: string): NodeDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAll().filter(
      (def) =>
        def.contract.name.toLowerCase().includes(lowerQuery) ||
        def.contract.description.toLowerCase().includes(lowerQuery) ||
        def.contract.type.toLowerCase().includes(lowerQuery)
    )
  }
}

// Export singleton instance
export const nodeRegistry = NodeRegistry.getInstance()

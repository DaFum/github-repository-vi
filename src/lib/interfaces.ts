/**
 * Interface for objects that have a lifecycle (initialization and disposal).
 */
export interface Lifecycle {
  /**
   * Initializes the object.
   */
  initialize(): Promise<void> | void
  /**
   * Cleans up resources used by the object.
   */
  dispose(): Promise<void> | void
}

/**
 * Interface for factories that create service instances.
 * @template T The type of service created.
 */
export interface ServiceFactory<T> {
  /**
   * Creates a new instance of the service.
   * @param config Optional configuration for the service.
   */
  create(config?: Record<string, unknown>): T
}

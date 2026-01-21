export interface Lifecycle {
  initialize(): Promise<void> | void
  dispose(): Promise<void> | void
}

export interface ServiceFactory<T> {
  create(config?: Record<string, unknown>): T
}

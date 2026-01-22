/**
 * Token
 *
 * The "currency" of the Token-Passing execution model.
 * Tokens carry data through the graph, similar to Petri Nets.
 */

export type Token = {
  // Unique identifier
  id: string

  // The data being passed
  data: unknown

  // Provenance: where did this data come from?
  sourceNodeId: string

  // Timestamp of creation
  createdAt: number

  // Edge this token is traveling on (nodeId:handleId -> nodeId:handleId)
  edgeId: string

  // Metadata for debugging
  metadata?: {
    nodeVersion?: number // For loop support
    iteration?: number // Which iteration of a loop
    path?: string[] // History of nodes this token has visited
  }
}

/**
 * Null Token
 *
 * Represents a "dead-end" or skipped branch.
 * Used for graceful handling of conditional paths.
 */
export type NullToken = Token & {
  isNull: true
  reason: string // Why this token is null
}

/**
 * Create a new token
 */
export function createToken(
  sourceNodeId: string,
  edgeId: string,
  data: unknown,
  metadata?: Token['metadata']
): Token {
  return {
    id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    data,
    sourceNodeId,
    edgeId,
    createdAt: Date.now(),
    metadata,
  }
}

/**
 * Create a null token (for dead-end branches)
 */
export function createNullToken(sourceNodeId: string, edgeId: string, reason: string): NullToken {
  return {
    ...createToken(sourceNodeId, edgeId, null),
    isNull: true,
    reason,
  }
}

/**
 * Check if a token is null
 */
export function isNullToken(token: Token): token is NullToken {
  return 'isNull' in token && token.isNull === true
}

/**
 * Clone a token (for branching)
 */
export function cloneToken(token: Token, newEdgeId: string): Token {
  return {
    ...token,
    id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    edgeId: newEdgeId,
    metadata: {
      ...token.metadata,
      path: [...(token.metadata?.path || []), token.sourceNodeId],
    },
  }
}

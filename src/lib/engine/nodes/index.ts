/**
 * Built-in Node Types
 *
 * This module exports all standard node types and registers them
 * with the NodeRegistry on import.
 */

import { nodeRegistry } from '../NodeRegistry'
import { LLMAgentNode } from './LLMAgentNode'
import { RouterNode } from './RouterNode'
import { HumanApprovalNode } from './HumanApprovalNode'

// Export individual nodes
export { LLMAgentNode } from './LLMAgentNode'
export { RouterNode } from './RouterNode'
export { HumanApprovalNode } from './HumanApprovalNode'

/**
 * Register all built-in nodes
 */
export function registerBuiltInNodes(): void {
  // Agent Nodes
  nodeRegistry.register(LLMAgentNode)

  // Logic Nodes
  nodeRegistry.register(RouterNode)

  // Human Nodes
  nodeRegistry.register(HumanApprovalNode)

  console.log(`✅ Registered ${nodeRegistry.size} built-in node types`)
}

/**
 * Get all built-in node definitions
 */
export function getBuiltInNodes() {
  return [LLMAgentNode, RouterNode, HumanApprovalNode]
}

/**
 * Graph Engine Usage Examples
 */

import { GraphEngine, type GraphDefinition } from './GraphEngine'
import { registerBuiltInNodes } from './nodes'

// Register nodes before running examples
registerBuiltInNodes()

// ============================================
// Example 1: Simple Linear Flow
// ============================================

export function example1_SimpleLinearFlow() {
  console.log('\n=== Example 1: Simple Linear Flow ===')

  const graph: GraphDefinition = {
    nodes: [
      {
        id: 'start',
        type: 'llm-agent',
        config: {
          model: 'openai',
          temperature: 0.7,
        },
      },
    ],
    edges: [],
  }

  const engine = new GraphEngine(graph, {
    maxConcurrent: 1,
    autoStart: false,
  })

  // Set input
  engine.setGlobal('userPrompt', 'Explain quantum computing in one sentence')

  // Subscribe to updates
  engine.subscribe((context) => {
    console.log('Status:', context.status)

    for (const [nodeId, state] of context.nodeStates) {
      if (state.status === 'completed') {
        console.log(`Node ${nodeId} completed:`, state.output)
      }
    }

    if (context.status === 'completed') {
      console.log('✅ Graph execution completed!')
    }
  })

  // Start execution
  engine.start()
}

// ============================================
// Example 2: Parallel Execution
// ============================================

export function example2_ParallelExecution() {
  console.log('\n=== Example 2: Parallel Execution ===')

  const graph: GraphDefinition = {
    nodes: [
      { id: 'task1', type: 'llm-agent', config: {} },
      { id: 'task2', type: 'llm-agent', config: {} },
      { id: 'task3', type: 'llm-agent', config: {} },
    ],
    edges: [],
  }

  const engine = new GraphEngine(graph, {
    maxConcurrent: 3, // All 3 execute simultaneously
  })

  const startTime = Date.now()

  engine.subscribe((context) => {
    if (context.status === 'completed') {
      const duration = Date.now() - startTime
      console.log(`✅ All 3 tasks completed in parallel in ${duration}ms`)
    }
  })
}

// ============================================
// Example 3: Conditional Routing
// ============================================

export function example3_ConditionalRouting() {
  console.log('\n=== Example 3: Conditional Routing ===')

  const graph: GraphDefinition = {
    nodes: [
      { id: 'input', type: 'llm-agent', config: {} },
      { id: 'router', type: 'router', config: {} },
      { id: 'path_true', type: 'llm-agent', config: {} },
      { id: 'path_false', type: 'llm-agent', config: {} },
    ],
    edges: [
      { id: 'e1', source: 'input', target: 'router' },
      { id: 'e2', source: 'router', target: 'path_true', sourceHandle: 'true' },
      { id: 'e3', source: 'router', target: 'path_false', sourceHandle: 'false' },
    ],
  }

  const engine = new GraphEngine(graph)

  engine.subscribe((context) => {
    if (context.status === 'completed') {
      const routerOutput = context.nodeStates.get('router')?.output
      console.log('Router decision:', routerOutput)

      const truePath = context.nodeStates.get('path_true')
      const falsePath = context.nodeStates.get('path_false')

      if (truePath?.status === 'completed') {
        console.log('✅ True path executed')
      }
      if (falsePath?.status === 'completed') {
        console.log('✅ False path executed')
      }
    }
  })
}

// ============================================
// Example 4: Barrier Synchronization
// ============================================

export function example4_BarrierSync() {
  console.log('\n=== Example 4: Barrier Synchronization ===')

  // Pattern: Multiple parallel tasks → Single merge node

  const graph: GraphDefinition = {
    nodes: [
      { id: 'fetch1', type: 'llm-agent', config: {} },
      { id: 'fetch2', type: 'llm-agent', config: {} },
      { id: 'fetch3', type: 'llm-agent', config: {} },
      { id: 'merge', type: 'llm-agent', config: {} },
    ],
    edges: [
      { id: 'e1', source: 'fetch1', target: 'merge', targetHandle: 'input1' },
      { id: 'e2', source: 'fetch2', target: 'merge', targetHandle: 'input2' },
      { id: 'e3', source: 'fetch3', target: 'merge', targetHandle: 'input3' },
    ],
  }

  const engine = new GraphEngine(graph)

  engine.subscribe((context) => {
    const merge = context.nodeStates.get('merge')

    if (merge?.status === 'working') {
      console.log('⏳ Merge node waiting for all 3 inputs...')
    }

    if (merge?.status === 'completed') {
      console.log('✅ All inputs collected, merge executed!')
    }
  })
}

// ============================================
// Example 5: Variable Interpolation
// ============================================

export function example5_VariableInterpolation() {
  console.log('\n=== Example 5: Variable Interpolation ===')

  const graph: GraphDefinition = {
    nodes: [
      {
        id: 'step1',
        type: 'llm-agent',
        config: {
          prompt: '{{$global.userQuestion}}',
        },
      },
      {
        id: 'step2',
        type: 'llm-agent',
        config: {
          prompt: 'Summarize this: {{step1.output}}',
        },
      },
    ],
    edges: [{ id: 'e1', source: 'step1', target: 'step2' }],
  }

  const engine = new GraphEngine(graph, { autoStart: false })

  // Set variables
  engine.setGlobal('userQuestion', 'What is machine learning?')
  engine.setEnv('API_KEY', 'sk-test-123')

  engine.subscribe((context) => {
    const step2 = context.nodeStates.get('step2')
    if (step2?.status === 'completed') {
      console.log('✅ Step 2 used interpolated value from step 1')
      console.log('Result:', step2.output)
    }
  })

  engine.start()
}

// ============================================
// Example 6: Real-time Progress Tracking
// ============================================

export function example6_ProgressTracking() {
  console.log('\n=== Example 6: Progress Tracking ===')

  const graph: GraphDefinition = {
    nodes: [
      { id: 'n1', type: 'llm-agent', config: {} },
      { id: 'n2', type: 'llm-agent', config: {} },
      { id: 'n3', type: 'llm-agent', config: {} },
      { id: 'n4', type: 'llm-agent', config: {} },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
    ],
  }

  const engine = new GraphEngine(graph)

  engine.subscribe((context) => {
    const total = context.nodeStates.size
    const completed = Array.from(context.nodeStates.values()).filter(
      (s) => s.status === 'completed'
    ).length

    const progress = Math.round((completed / total) * 100)
    console.log(`Progress: ${progress}% (${completed}/${total})`)

    if (context.status === 'completed') {
      console.log('✅ 100% Complete!')
    }
  })
}

// ============================================
// Example 7: Error Handling & Retries
// ============================================

export function example7_ErrorHandling() {
  console.log('\n=== Example 7: Error Handling ===')

  const graph: GraphDefinition = {
    nodes: [{ id: 'unreliable', type: 'llm-agent', config: {} }],
    edges: [],
  }

  const engine = new GraphEngine(graph)

  engine.subscribe((context) => {
    const node = context.nodeStates.get('unreliable')

    if (node?.status === 'pending' && node.retryCount > 0) {
      console.log(`⚠️ Retry attempt ${node.retryCount}/3`)
    }

    if (node?.status === 'error') {
      console.log('❌ Node failed after 3 retries')
      console.log('Error:', node.error?.message)
    }
  })
}

// ============================================
// Example 8: Pause & Resume
// ============================================

export function example8_PauseResume() {
  console.log('\n=== Example 8: Pause & Resume ===')

  const graph: GraphDefinition = {
    nodes: [
      { id: 'n1', type: 'llm-agent', config: {} },
      { id: 'n2', type: 'llm-agent', config: {} },
      { id: 'n3', type: 'llm-agent', config: {} },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ],
  }

  const engine = new GraphEngine(graph)

  engine.subscribe((context) => {
    const n2 = context.nodeStates.get('n2')

    if (n2?.status === 'completed') {
      console.log('⏸️ Pausing after n2...')
      engine.pause()

      // Resume after 2 seconds
      setTimeout(() => {
        console.log('▶️ Resuming...')
        engine.resume()
      }, 2000)
    }

    if (context.status === 'completed') {
      console.log('✅ Execution completed')
    }
  })
}

// ============================================
// Run all examples
// ============================================

export function runAllExamples() {
  example1_SimpleLinearFlow()
  example2_ParallelExecution()
  example3_ConditionalRouting()
  example4_BarrierSync()
  example5_VariableInterpolation()
  example6_ProgressTracking()
  example7_ErrorHandling()
  example8_PauseResume()
}

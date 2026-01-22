The ErrorFallback component in src/ErrorFallback.tsx re-throws errors in development mode to bypass the error boundary for easier debugging.

The vite.config.ts must NOT include define: { global: 'window' } as it conflicts with vite-plugin-node-polyfills, causing runtime crashes (blank page) with libraries like simple-peer.

Tailwind CSS configuration uses a plugin to register raw media queries (e.g., pwa, coarse) as variants instead of extend.screens to prevent conflicts with the .container class.

The project enforces a consistent import strategy (preferring static imports) for shared modules like pollinations.ts to avoid Vite build warnings about mixed static/dynamic imports.

The project uses vite-plugin-node-polyfills in vite.config.ts to provide Node.js built-ins (e.g., events) required by dependencies like simple-peer.

Dynamic data structures (e.g., node configs) should use Record<string, unknown> instead of any to ensure type safety, with any usage strictly linted against.

React components must avoid impure operations (e.g., Date.now(), Math.random()) during rendering; these values should be captured via lazy useState initialization to satisfy react-hooks/purity rules.

Dependency management follows an aggressive update strategy, using npx npm-check-updates -u followed by npm install to keep all packages at their latest available versions.

Initial environment setup requires running npm install to ensure all dependencies (e.g., @xyflow/react) are present.

The project uses Vite as the build tool and development server.

Vite dependency resolution errors (e.g., "Failed to resolve import") can occur even when dependencies are installed due to stale cache. Run npm run optimize or rm -rf node_modules/.vite to clear Vite's dependency optimization cache and resolve these issues.

The project uses Prettier (.prettierrc) for code formatting with singleQuote: true, semi: false, and prettier-plugin-tailwindcss enabled.

The 'Black Box Recorder' (src/lib/graph/HistoryRecorder.ts) tracks provenance and immutable state snapshots for debugging.

The project uses ESLint with a flat configuration (eslint.config.js) including typescript-eslint and eslint-config-prettier to integrate with Prettier.

Code quality is enforced via npm run lint and formatting via npx prettier --write ..

The 'Infinity Store' (src/lib/store/BlueprintRegistry.ts) manages the export and import of agent blueprints (graphs, schemas) as compressed ZIP files using jszip.

The 'Genetic Optimizer' (src/lib/optimizer/GeneticPrompt.ts) implements adversarial evolution algorithms (mutate, score, mate) to automatically optimize prompts.

The 'Neural Mesh' feature enables serverless P2P agent communication via WebRTC using simple-peer, located in src/lib/mesh/P2PClient.ts.

The 'Ocular Cortex' (src/lib/vision/ScreenWatcher.ts) uses the getDisplayMedia API to capture and analyze screen content via vision models.

The 'Synaptic Binding' architecture phase introduces Interpolator, NodeRegistry, and HistoryRecorder to eliminate system fragility.

The 'Universal Translator' logic is implemented in src/lib/graph/Interpolator.ts, handling recursive input hydration and type coercion against Zod schemas.

The NodeRegistry supports dynamic node definitions via 'Behavioral Contracts' (inputs/outputs Zod schemas) to link execution logic with UI components.

Graph data structures (ExecutionContext, NodeExecutionState) are defined in src/lib/graph/types.ts and strictly validated using zod.

The GraphExecutionEngine, located in src/lib/graph/GraphEngine.ts, implements a reactive DAG executor with cycle support using a 'Token-Passing' architecture.

The engine uses filtrex for safe expression parsing within Logic Nodes.

The GraphExecutionEngine supports 'Human-in-the-Loop' suspension, serializing the execution state to localStorage when user input is required.

The execution engine operates on a ~50ms 'Heartbeat' tick cycle to manage node activation and state transitions asynchronously.

The 'Recursive Refinement' loop involves generating content, critiquing it (0-100 score), and regenerating if the score is below 95.

The PollinationsClient includes a 'Cost-Arbitrage' broker (smartSelectModel) that routes prompts to different models (e.g., openai, qwen-coder) based on complexity and intent.

HyperSmolAgents implements a 'Cognitive Mesh' (Phase 1) including a 'Devil's Advocate' (audit task) and 'Recursive Refinement' (refine task) capabilities.

The project adheres to the philosophy 'The Browser is the Operating System', moving cognitive load to the frontend/edge.

The 'Building Station' is a visual, node-based agent editor implemented using @xyflow/react (v12), @dnd-kit, and zustand.

The project integrates @modelcontextprotocol/sdk to enable the frontend to mount local tools and resources (filesystem, APIs).

Flow-based components are located in src/components/flow/ and state is managed in src/store/flowStore.ts.

The application features a toggleable 'Builder' view in App.tsx, accessible via a Circuitry icon, which renders the FlowEditor.

The project uses src/lib/pollinations.ts as a type-safe client for the Pollinations.ai API, replacing legacy window.spark.llm calls.

Pollinations.ai API keys are managed via the PollinationsClient and persisted in localStorage under the key 'pollinations_api_key'.

The UI follows an 'Async First' architecture where components enqueue tasks to HyperSmolAgents and react to state changes instead of making direct blocking API calls.

The command npm run build is critical for verifying TypeSafety and catching build errors.

The project uses an 'AGENTS.md' file to provide context, role definitions, and strict architectural directives for AI agents.

The user operates under the 'HyperSmol_ARCHITECT_ZERO' persona, requiring a 'Visionary' tone and 'Pragmatic Sophistication' in documentation and code.

The central agent class is named 'HyperSmolAgents' and the singleton instance is exported as 'hyperSmolAgents'.

The agent system implements a 'Self-Healing' mechanism where 'selfOptimize' triggers automatically every 10 completed tasks.

The project's core agent logic is located in 'src/lib/hypersmolagents.ts', replacing the previous 'agent-kernel.ts'.

'ARCHITECTURE.md' serves as the primary 'ARCHITECTURAL BLUEPRINT' and planning document for the project.

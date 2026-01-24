# AETHER_OS

> **HyperSmol Visual Agent Orchestrator**
>
> *"The Browser is the Operating System"*

![Aether OS](https://image.pollinations.ai/prompt/A%20futuristic%20cypherpunk%20interface%20dashboard%20with%20neon%20cyan%20and%20magenta%20accents%20displaying%20network%20nodes%20and%20code%20fragments?model=flux&width=1024&height=512&nologo=true)

A local-first, privacy-focused visual environment for building, executing, and evolving autonomous AI agents. Built on the **HyperSmol** architecture.

---

## 🚀 Features

- **Visual Agent Builder**: Drag-and-drop node editor for defining complex agent workflows.
- **Local-First Architecture**: All data stored locally (IndexedDB/localStorage). No backend required.
- **Universal Model Support**: Connect to OpenAI, Anthropic, Gemini, or local models via Pollinations.ai or MCP.
- **Neo-Brutalist Interface**: High-performance, low-friction UI designed for engineers.
- **Skill System**: Protocol-based development methodology for reliable agent self-improvement.
- **Vault**: Encrypted local storage for agent artifacts (images, chat logs, workflows).
- **HoloChat**: Context-aware chat interface for interacting with your agent swarm.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **State**: Zustand + `@github/spark/hooks` (useKV)
- **Visuals**: Tailwind CSS v4 (Neo-Brutalism), Framer Motion, Phosphor Icons
- **Graph Engine**: Custom Token-Passing DAG Executor (Petri Net inspired)
- **AI**: Pollinations.ai (Serverless inference), MCP (Local tools)

## ⚡ Quick Start

1.  **Clone & Install**
    ```bash
    git clone https://github.com/yourusername/aether-os.git
    cd aether-os
    npm install
    ```

2.  **Start Dev Server**
    ```bash
    npm run dev
    ```

3.  **Open in Browser**
    Navigate to `http://localhost:5000`

## 🧬 Architecture

AETHER_OS follows the **HyperSmol** philosophy:
- **Small Core**: The kernel (`HyperSmolAgents`) is minimal and extensible.
- **Bio-Digital**: Components have lifecycles (`initialize`, `dispose`) and "pulses" (heartbeat).
- **Agent-First**: The codebase itself is documented to be understood and modified by AI agents (`AGENTS.md`, `skills/`).

See [ARCHITECTURE.md](ARCHITECTURE.md) for a deep dive.

## 📚 Documentation

- **[AGENTS.md](AGENTS.md)**: The "Constitution" for AI developers working on this repo.
- **[Skill Protocol](docs/SKILL_PROTOCOL.md)**: How to use the installed development skills.
- **[Graph Engine](src/lib/engine/README.md)**: Documentation for the visual execution engine.
- **[Node Registry](src/lib/engine/NODE_REGISTRY.md)**: How to create custom nodes.

## 🤝 Contributing

We use a **Skill-Based** contribution workflow.
1.  Read `docs/SKILL_PROTOCOL.md`.
2.  Select the appropriate skill (e.g., `subagent-driven-development`).
3.  Execute the protocol.

## 📄 License

MIT

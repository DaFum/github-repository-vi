# 🧬 AETHER_OS

> **Visual Agent Orchestrator** — A Client-Side, Edge-First Multi-Agent System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB)](https://react.dev)
[![Powered by](https://img.shields.io/badge/powered%20by-Pollinations.ai-FF6B9D)](https://pollinations.ai)

---

## 🌟 What is AETHER_OS?

**AETHER_OS** is a **zero-backend, client-side agent orchestration platform** that runs entirely in your browser. It combines visual workflow building, multi-model AI routing, and advanced agent patterns to create a **"Glass-Browser" Architecture** — transparent, ultra-fast, and privacy-first.

### Key Differentiators:

- 🌐 **No Backend Required** — Everything runs locally or on the edge
- 🎨 **Visual-First Design** — Build agent workflows with drag-and-drop
- 🧠 **Multi-Model Intelligence** — Route between GPT-4, Claude, Gemini, and local models
- 🔐 **Privacy by Design** — Your data never leaves your machine (unless you explicitly send it to an LLM)
- ⚡ **Real-Time Execution** — See your agents think in real-time on the canvas

---

## 🏗️ Architecture

```
┌────────────────────────────────────────┐
│   AETHER_OS (Browser-Native)          │
├────────────────────────────────────────┤
│  MODULES:                              │
│  • SYNAPSE    - Visual Agent Builder  │
│  • CANVAS     - Real-Time Creation    │
│  • HOLO-CHAT  - Visual Agent Chat     │
│  • VAULT      - Artifact Storage      │
├────────────────────────────────────────┤
│  CORE SYSTEMS:                         │
│  • Graph Execution Engine              │
│  • Universal Translator (Zod)         │
│  • Dynamic Node Registry              │
│  • Provenance Tracker                 │
└────────────────────────────────────────┘
```

### Tech Stack:

- **Frontend:** React 19, TypeScript, Vite
- **Flow Editor:** @xyflow/react (ReactFlow v12)
- **State:** Zustand + Immer
- **UI:** Radix UI + Tailwind CSS
- **AI:** Pollinations.ai (BYOP - Bring Your Own Provider)
- **Validation:** Zod
- **P2P:** WebRTC (for agent mesh)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. (Optional) Configure AI Provider

Get your API key from [pollinations.ai](https://enter.pollinations.ai) and configure it in Settings (⚙️ icon).

---

## 📦 Modules

### 🕸️ SYNAPSE — Visual Agent Builder

The core workflow editor. Build multi-agent systems using:

- **Agent Nodes** — LLM-powered reasoning units
- **Tool Nodes** — MCP-compatible actions (File I/O, APIs, etc.)
- **Logic Nodes** — Routers, Barriers, Iterators
- **Human Nodes** — Human-in-the-loop checkpoints

**Features:**
- Token-passing execution model
- Loop support with safety counters
- Provenance tracking (see exactly where data came from)
- Real-time visual debugging

### 🎨 CANVAS — Live Creation (Coming Soon)

Real-time image generation with dual-model workflow:
- **Preview Model** — Fast iteration (Turbo, Schnell)
- **Render Model** — High-quality output (Flux, Midjourney)

### 💬 HOLO-CHAT — Visual Agent (Coming Soon)

Chat interface where the AI controls the visual context:
- Background visualization updates with conversation
- Code execution with plot rendering (Gemini)
- Markdown + Image support

### 🏛️ VAULT — Artifact Storage (Coming Soon)

Local-first history and remix functionality:
- Store all creations in browser storage
- Remix previous workflows with exact model settings
- Export/Import blueprints

---

## 🧠 Advanced Features

### 🔄 Recursive Refinement Loop

Agents that self-critique and improve until quality threshold is met.

### 🤝 Hive-Mind Consensus

Query multiple models in parallel and synthesize a unified answer.

### 🌐 Neural Mesh (P2P)

Browser-to-browser agent communication via WebRTC (no server).

### 👁️ Ocular Cortex

Screen-aware agents that can "watch" other windows and react to visual state.

### 🧬 Genetic Optimizer

Evolutionary prompt optimization using adversarial selection.

---

## 📖 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Agent System Design](./AGENTS.md)

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## 📄 License

MIT License — Copyright © 2026

Built with ⚡ by [Architect Zero](https://github.com/DaFum/github-repository-vi)

---

## 🙏 Acknowledgments

- **Pollinations.ai** — Multi-model API access
- **HuggingFace** — smolagents inspiration
- **ReactFlow** — Visual graph engine
- **Radix UI** — Accessible primitives

---

_"The Browser is the Operating System. The Agent is the Interface."_

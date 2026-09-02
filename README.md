# 🛡️ PhishGuard AI

> **Autonomous Defense Against Phishing & Social Engineering**

PhishGuard AI is a full-stack, AI-powered security platform that autonomously detects, analyzes, and responds to phishing emails and social engineering attacks in real time. It combines a multi-step reasoning pipeline with semantic threat memory to protect organizations against evolving cyber threats.

---

## ✨ Features

- 🤖 **Autonomous Security Agent** — Multi-step OBSERVE → PROTECT → REASON → INVESTIGATE → CORRELATE → DECIDE pipeline
- 🧠 **AI-Powered Analysis** — Claude (Anthropic) for semantic reasoning; falls back to deterministic heuristics in demo mode
- 🗄️ **Semantic Threat Memory** — Qdrant vector database stores and retrieves past threat patterns for correlation
- 🔒 **AI Security Gate** — Enkrypt AI guards against prompt injection and adversarial inputs
- 🎯 **Agent Orchestration** — Lyzr orchestrates tool execution plans dynamically
- 📊 **Live Dashboard** — Real-time incident feed, risk scores, and agent activity via SSE
- 🚨 **Intervention Engine** — Automated quarantine, escalation, and remediation decisions
- 🏗️ **Architecture Viewer** — Visual breakdown of the agent pipeline

---

## 🏛️ Architecture

```
Email / Message Input
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                   PhishGuard Security Agent             │
│                                                         │
│  OBSERVE → PROTECT (Enkrypt) → REASON (Lyzr)           │
│      → INVESTIGATE (Tools) → CORRELATE (Qdrant)        │
│      → FUSE Evidence → CHALLENGE Benignity             │
│      → SCORE (Risk Engine) → DECIDE (Intervention)     │
└─────────────────────────────────────────────────────────┘
        │
        ▼
   Incident Store → Dashboard / Analyst UI
```

### Agent Tools

| Tool | Purpose |
|---|---|
| `inspectMessage` | Header & body heuristic inspection |
| `determineIntent` | Classifies attacker intent |
| `analyzeURL` | Extracts & scores suspicious URLs |
| `contextAnalyzer` | Employee context-awareness |
| `threatMemory` | Qdrant-backed semantic similarity search |
| `promptInjectionDetector` | Guards against adversarial prompt attacks |

---

## 🗂️ Project Structure

```
dynamic/
├── client/                   # React + Vite + TypeScript frontend
│   └── src/
│       ├── pages/
│       │   ├── DashboardPage.tsx        # Overview & metrics
│       │   ├── LiveMonitorPage.tsx      # Real-time email analysis
│       │   ├── IncidentsPage.tsx        # Incident management
│       │   ├── IncidentDetailPage.tsx   # Per-incident deep-dive
│       │   ├── ThreatMemoryPage.tsx     # Qdrant threat corpus viewer
│       │   ├── AgentActivityPage.tsx    # Step-by-step agent trace
│       │   ├── ArchitecturePage.tsx     # Pipeline diagram
│       │   └── LoginPage.tsx
│       └── components/
│
├── server/                   # Node.js + Express + TypeScript backend
│   └── src/
│       ├── agent/
│       │   ├── securityAgent.ts         # Core orchestrator (OODA loop)
│       │   ├── evidenceFusion.ts        # Merges multi-source signals
│       │   ├── riskEngine.ts            # Deterministic final scorer
│       │   ├── interventionEngine.ts    # Quarantine / escalation logic
│       │   └── tools/                   # Individual analysis tools
│       ├── services/
│       │   ├── enkryptService.ts        # Enkrypt AI integration
│       │   ├── lyzrService.ts           # Lyzr agent orchestration
│       │   └── qdrantService.ts         # Vector DB integration
│       ├── routes/                      # REST API endpoints
│       ├── store/
│       │   └── incidentStore.ts         # In-memory incident state
│       └── data/
│           └── threatCorpus.json        # Local threat seed data
│
├── .env.example              # Environment variable template
├── netlify.toml              # Frontend deployment config
└── package.json              # Monorepo scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone the Repository

```bash
git clone https://github.com/ravishankar078/dynamic.git
cd dynamic
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys (all optional — the app runs in **Demo Mode** without them):

| Variable | Service | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude (semantic reasoning) | Optional |
| `LYZR_API_KEY` + `LYZR_AGENT_ID` | Lyzr (agent orchestration) | Optional |
| `QDRANT_URL` + `QDRANT_API_KEY` | Qdrant (threat memory) | Optional |
| `ENKRYPT_API_KEY` | Enkrypt AI (security gate) | Optional |
| `SESSION_SECRET` | Express session | Recommended |

### 4. Start Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 5. Log In

Use the demo credentials (set in `.env`):

```
Email:    analyst@phishguard.test
Password: PhishGuard2026!
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Submit an email/message for analysis |
| `GET` | `/api/incidents` | List all detected incidents |
| `GET` | `/api/events/stream` | SSE stream of live agent events |
| `POST` | `/api/messages/incoming` | Ingest a new raw message |
| `GET` | `/api/system/health` | Integration health check |
| `POST` | `/api/auth/login` | Authenticate analyst |
| `POST` | `/api/auth/logout` | End session |

---

## 🧪 Demo Mode

PhishGuard AI runs fully in **Demo Mode** with no API keys required. In this mode:

- The risk engine uses deterministic heuristics instead of Claude
- Threat memory falls back to the local `threatCorpus.json`
- Enkrypt protection uses a local fallback ruleset
- Lyzr orchestration uses a built-in default tool plan

---

## 🌐 Deployment

### Frontend (Netlify)

The client is pre-configured for Netlify via `netlify.toml`:

```bash
# Build command
cd client && npm install && npm run build

# Publish directory
client/dist
```

### Backend

Deploy the `server/` directory to any Node.js-compatible host (Railway, Render, Fly.io, etc.). Set all environment variables in your hosting provider's dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Reasoning** | Anthropic Claude |
| **Agent Orchestration** | Lyzr |
| **Vector Database** | Qdrant |
| **AI Security** | Enkrypt AI |
| **Real-time** | Server-Sent Events (SSE) |
| **Auth** | express-session |
| **Deployment** | Netlify (frontend) |

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">Built with ❤️ to make the internet safer.</p>

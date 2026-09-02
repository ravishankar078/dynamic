import React from 'react';

// ─── ArchitecturePage.tsx ─────────────────────────────────────────────
// Full 11-stage pipeline diagram with one-line component descriptions.

const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold tracking-wider text-white">SYSTEM ARCHITECTURE</h1>
        <p className="text-xs text-slate-500 tracking-wider">
          End-to-End Agentic Cybersecurity Gateway — Message → Decision
        </p>
      </div>

      {/* ── Full Pipeline Flow ── */}
      <div className="soc-panel p-6">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-6 font-semibold">
          Security Pipeline — 10 Stages
        </h2>

        <div className="flex flex-col items-center gap-0">
          <PipelineNode
            phase="OBSERVE"
            title="Incoming Message"
            desc="Email / Link intercepted at the Security Gateway. Input sanitized, HTML stripped, URLs extracted."
            icon="📩"
            color="border-slate-600 bg-slate-900/50 text-slate-300"
          />
          <DownArrow />
          <PipelineNode
            phase="PROTECT"
            title="Enkrypt AI Security Gate"
            desc="Protects the AI boundary from adversarial input — detects prompt injections, jailbreaks, and system override attempts before the agent sees the content."
            icon="🛡️"
            color="border-cyber-red/30 bg-cyber-red/5 text-cyber-red"
            badge="ENKRYPT AI"
          />
          <DownArrow />
          <PipelineNode
            phase="PROTECT +"
            title="Local Prompt Injection Scan"
            desc="Pattern-based redundant detector — runs regardless of Enkrypt status to ensure double coverage."
            icon="🔒"
            color="border-cyber-red/20 bg-cyber-red/5 text-cyber-red/70"
          />
          <DownArrow />
          <PipelineNode
            phase="REASON"
            title="Lyzr Security Agent"
            desc="Orchestrates the security investigation — receives sanitized metadata and returns a structured JSON tool execution plan. Tools only execute if selected."
            icon="🤖"
            color="border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan"
            badge="LYZR AGENT"
          />
          <DownArrow />
          <PipelineNode
            phase="INVESTIGATE"
            title="Security Tools"
            desc="Lyzr-selected tools execute: Intent Classifier, Social Engineering Detector, URL Analyser, Context Analyser. URL analysis skipped if no URLs present."
            icon="🔍"
            color="border-blue-500/30 bg-blue-500/5 text-blue-400"
          />
          <DownArrow />
          <PipelineNode
            phase="CORRELATE"
            title="Qdrant Threat Memory"
            desc="Retrieves semantically similar historical threat patterns using vector embeddings. Results become explicit evidence inputs — Qdrant alone cannot block a message."
            icon="🧠"
            color="border-purple-500/30 bg-purple-500/5 text-purple-400"
            badge="QDRANT"
          />
          <DownArrow />
          <PipelineNode
            phase="COMBINE"
            title="Evidence Fusion"
            desc="All streams unified: manipulation signals + intent + URLs + context + local threats + Enkrypt findings + Qdrant matches → weighted evidence set."
            icon="⚗️"
            color="border-indigo-500/30 bg-indigo-500/5 text-indigo-400"
          />
          <DownArrow />
          <PipelineNode
            phase="SCORE"
            title="Deterministic Risk Engine"
            desc="Produces the final risk score and level. The LLM has NO input into this calculation. Starts at TRUST=50, applies deterministic ledger of additions/deductions, maps to action."
            icon="⚡"
            color="border-cyber-yellow/30 bg-cyber-yellow/5 text-cyber-yellow"
            badge="NO LLM"
          />
          <DownArrow />
          <PipelineNode
            phase="CHALLENGE"
            title="Benignity Challenge"
            desc="Adversarial self-challenge: what is the strongest case for this message being legitimate? If credible, assessment is confirmed or adjusted."
            icon="⚖️"
            color="border-orange-500/30 bg-orange-500/5 text-orange-400"
          />
          <DownArrow />
          <PipelineNode
            phase="DECIDE"
            title="Intervention Engine"
            desc="State machine maps risk level + intent + signals to one of: ALLOW / WARN / QUARANTINE / BLOCK."
            icon="🎯"
            color="border-cyber-green/30 bg-cyber-green/5 text-cyber-green"
          />
          <DownArrow />
          <PipelineNode
            phase="INTERVENE"
            title="Employee Protected"
            desc="Message allowed, warned, quarantined, or blocked. Incident stored. Real-time alert broadcast to SOC. Qdrant memory updated for future threat correlation."
            icon="✅"
            color="border-cyber-green/40 bg-cyber-green/10 text-cyber-green"
            badge="EMPLOYEE PROTECTED"
          />
        </div>
      </div>

      {/* ── Component Detail Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComponentCard
          number="01"
          name="Enkrypt AI"
          tagline="Protects the AI boundary from adversarial input."
          description="Intercepts incoming messages before any AI processing. Detects prompt injection attacks, jailbreak attempts, and system override instructions. Its findings become explicit security evidence items in the risk engine — critical Enkrypt findings reduce trust by 35 points."
          tech="Enkrypt Guardrails API • Local Regex Detector Fallback"
          color="border-l-cyber-red"
        />
        <ComponentCard
          number="02"
          name="Lyzr Security Agent"
          tagline="Orchestrates the security investigation."
          description="Receives sanitized message metadata and returns a structured JSON tool execution plan {tools: [...]}. Tools only run if selected by Lyzr. If Lyzr is unavailable, an intelligent local fallback produces the plan based on message properties (has URLs, has context, injection detected)."
          tech="Lyzr Agent REST API • Local Intelligent Tool Planner Fallback"
          color="border-l-cyber-cyan"
        />
        <ComponentCard
          number="03"
          name="Qdrant"
          tagline="Retrieves semantically similar historical threat patterns."
          description="Stores attack payloads as 384-dim vector embeddings. Performs cosine similarity search on incoming messages. High similarity (≥75%) reduces trust by 8–15 points depending on intent match. Similarity alone (<55%) cannot trigger a block — Qdrant is evidence, not an arbiter."
          tech="Qdrant JS Client REST • Deterministic Hash Embedding (dev fallback)"
          color="border-l-purple-500"
        />
        <ComponentCard
          number="04"
          name="Claude"
          tagline="Provides semantic reasoning."
          description="Used for intent classification and social engineering analysis — understanding WHAT the sender wants the employee to DO. Claude's output is one evidence input among many; it never determines the final risk score or intervention decision."
          tech="Anthropic Claude API • Keyword Heuristic Fallback"
          color="border-l-blue-500"
        />
        <ComponentCard
          number="05"
          name="Deterministic Risk Engine"
          tagline="Produces deterministic risk and action — the LLM is excluded."
          description="Starts at TRUST = 50. Applies a deterministic trust ledger: each factor (signal, URL, context, Enkrypt, Qdrant) adds or subtracts a fixed number of points. The final score (100 − trust) maps to LOW/MEDIUM/HIGH/CRITICAL and then to ALLOW/WARN/QUARANTINE/BLOCK via the intervention state machine."
          tech="Pure TypeScript State Machine • No LLM • No ML"
          color="border-l-cyber-yellow"
        />
        <ComponentCard
          number="06"
          name="SSE Streaming"
          tagline="Every UI step corresponds to actual backend execution."
          description="POST /api/messages/incoming streams each agent step as a Server-Sent Event the moment it completes. No setTimeout animations. The frontend receives real events from real backend execution. High-risk decisions also broadcast to the global /api/events/stream for SOC alert toasts."
          tech="Node.js SSE • ReadableStream frontend reader"
          color="border-l-cyber-green"
        />
      </div>
    </div>
  );
};

// ── Sub-components ──

const PipelineNode: React.FC<{
  phase: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  badge?: string;
}> = ({ phase, title, desc, icon, color, badge }) => (
  <div className={`w-full max-w-2xl soc-panel border ${color} p-4 rounded-xl`}>
    <div className="flex items-start gap-3">
      <span className="text-2xl mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{phase}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-current opacity-70 font-bold tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-200 mb-1">{title}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

const DownArrow: React.FC = () => (
  <div className="flex flex-col items-center py-1">
    <div className="w-px h-3 bg-soc-border" />
    <div className="text-slate-700 text-xs">▼</div>
  </div>
);

const ComponentCard: React.FC<{
  number: string;
  name: string;
  tagline: string;
  description: string;
  tech: string;
  color: string;
}> = ({ number, name, tagline, description, tech, color }) => (
  <div className={`soc-panel p-5 border-l-4 ${color}`}>
    <div className="mb-3">
      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
        {number}
      </span>
      <h3 className="text-sm font-bold text-slate-200">{name}</h3>
      <p className="text-xs text-cyber-cyan italic mt-0.5">"{tagline}"</p>
    </div>
    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{description}</p>
    <div className="bg-soc-accent/20 px-3 py-1.5 rounded border border-soc-border/50">
      <p className="text-[10px] font-mono text-slate-500">
        Tech: <span className="text-slate-400">{tech}</span>
      </p>
    </div>
  </div>
);

export default ArchitecturePage;

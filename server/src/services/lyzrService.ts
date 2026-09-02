// ─── lyzrService.ts ──────────────────────────────────────────────────
// Lyzr Agent API integration.
// Key addition: orchestrateTools() — asks Lyzr to produce a structured
// JSON tool execution plan, so Lyzr genuinely orchestrates the investigation.
// Falls back to local orchestrator when LYZR_API_KEY is not configured.

let isConfigured = false;
let isHealthy = false;

export interface LyzrAgentResponse {
  source: 'lyzr' | 'local_fallback';
  response?: string;
  agentId?: string;
  sessionId?: string;
}

// Structured tool execution plan produced by Lyzr
export interface LyzrToolPlan {
  source: 'lyzr' | 'local_fallback';
  tools: string[];
  reasoning: string;
  agentId?: string;
}

// All available tools in default execution order
const ALL_TOOLS = [
  'promptInjectionDetector',
  'determineIntent',
  'inspectMessage',
  'analyzeURL',
  'contextAnalyzer',
  'qdrantThreatMemory',
];

export function initLyzr(): boolean {
  const apiKey = process.env.LYZR_API_KEY;
  const agentId = process.env.LYZR_AGENT_ID;

  if (!apiKey || !agentId) {
    console.log('[Lyzr] Not configured — using local orchestrator fallback');
    return false;
  }

  isConfigured = true;
  console.log(`[Lyzr] Configured with agent: ${agentId}`);
  return true;
}

// ── CORE: Ask Lyzr to produce a structured tool execution plan ──
// This is where Lyzr genuinely orchestrates — it receives message metadata
// and returns which tools should run and in what logical grouping.
export async function orchestrateTools(params: {
  sender: string;
  subject: string;
  bodyPreview: string;   // First 400 chars only — sanitized, no full payload
  hasURLs: boolean;
  hasEmployeeContext: boolean;
  enkryptFlagged: boolean;
  injectionDetected: boolean;
}): Promise<LyzrToolPlan> {
  // Local fallback: intelligent default tool selection
  const localPlan = buildLocalToolPlan(params);

  if (!isConfigured) {
    return { ...localPlan, source: 'local_fallback' };
  }

  const agentId = process.env.LYZR_AGENT_ID!;
  const apiKey = process.env.LYZR_API_KEY!;

  // Structured prompt — we pass only sanitized metadata, NOT the raw body
  // (raw body is untrusted; Enkrypt already screened it)
  const orchestrationPrompt = `You are the PhishGuard Security Agent orchestrator.
Based on the following email metadata, decide which security tools to run.

METADATA (sanitized):
- From: ${params.sender}
- Subject: ${params.subject}
- Body preview: ${params.bodyPreview}
- Has URLs: ${params.hasURLs}
- Has employee context: ${params.hasEmployeeContext}
- Enkrypt flagged as adversarial: ${params.enkryptFlagged}
- Prompt injection detected: ${params.injectionDetected}

AVAILABLE TOOLS:
- promptInjectionDetector: Detects AI manipulation patterns
- determineIntent: Classifies what the sender wants the employee to DO
- inspectMessage: Detects social engineering signals (urgency, fear, authority, etc.)
- analyzeURL: Analyses URLs for domain spoofing, homoglyphs, brand mismatch
- contextAnalyzer: Checks if message fits the employee's known context
- qdrantThreatMemory: Semantic search against historical threat patterns

RULES:
- Always include: promptInjectionDetector, determineIntent, inspectMessage, qdrantThreatMemory
- Include analyzeURL ONLY if hasURLs is true
- Include contextAnalyzer ONLY if hasEmployeeContext is true
- If enkryptFlagged or injectionDetected, place promptInjectionDetector first

Return ONLY valid JSON with NO other text:
{"tools": ["tool1", "tool2", ...], "reasoning": "one sentence explanation"}`;

  try {
    const response = await fetch(
      `https://agent-prod.studio.lyzr.ai/v3/agents/${agentId}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          message: orchestrationPrompt,
          context: {
            mode: 'tool_orchestration',
            hasURLs: params.hasURLs,
            hasEmployeeContext: params.hasEmployeeContext,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`[Lyzr] API returned ${response.status}`);
      isHealthy = false;
      return { ...localPlan, source: 'local_fallback' };
    }

    const data = (await response.json()) as any;
    isHealthy = true;

    // Extract the JSON tool plan from Lyzr's response
    const rawText: string = data.response || data.message || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { tools?: string[]; reasoning?: string };
      if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
        // Validate that tools are known tool names
        const validTools = parsed.tools.filter((t) => ALL_TOOLS.includes(t));
        // Always ensure the 4 mandatory tools are present
        const mandatory = ['promptInjectionDetector', 'determineIntent', 'inspectMessage', 'qdrantThreatMemory'];
        const finalTools = [...new Set([...validTools, ...mandatory])];
        // Restore canonical order
        const ordered = ALL_TOOLS.filter((t) => finalTools.includes(t));
        return {
          source: 'lyzr',
          agentId,
          tools: ordered,
          reasoning: parsed.reasoning || 'Lyzr tool plan applied',
        };
      }
    }

    console.warn('[Lyzr] Could not parse tool plan from response — using local fallback');
    isHealthy = false;
    return { ...localPlan, source: 'local_fallback' };
  } catch (err) {
    console.error('[Lyzr] orchestrateTools failed:', err);
    isHealthy = false;
    return { ...localPlan, source: 'local_fallback' };
  }
}

// Intelligent local tool plan (no Lyzr required)
function buildLocalToolPlan(params: {
  hasURLs: boolean;
  hasEmployeeContext: boolean;
  enkryptFlagged: boolean;
  injectionDetected: boolean;
}): LyzrToolPlan {
  const tools: string[] = [
    'promptInjectionDetector',
    'determineIntent',
    'inspectMessage',
  ];

  if (params.hasURLs) tools.push('analyzeURL');
  if (params.hasEmployeeContext) tools.push('contextAnalyzer');
  tools.push('qdrantThreatMemory');

  const reasons: string[] = [];
  if (!params.hasURLs) reasons.push('URL analysis skipped — no URLs in message');
  if (!params.hasEmployeeContext) reasons.push('Context analysis skipped — no employee context provided');
  if (params.enkryptFlagged || params.injectionDetected) reasons.push('Injection detection prioritized');

  return {
    source: 'local_fallback',
    tools,
    reasoning:
      reasons.length > 0
        ? reasons.join('; ')
        : 'All applicable tools selected for comprehensive analysis',
  };
}

// Legacy single-call interface (retained for compatibility)
export async function invokeAgent(
  message: string,
  context: Record<string, unknown> = {}
): Promise<LyzrAgentResponse> {
  if (!isConfigured) {
    return { source: 'local_fallback' };
  }

  try {
    const apiKey = process.env.LYZR_API_KEY!;
    const agentId = process.env.LYZR_AGENT_ID!;

    const response = await fetch(
      `https://agent-prod.studio.lyzr.ai/v3/agents/${agentId}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ message, context }),
      }
    );

    if (!response.ok) {
      isHealthy = false;
      return { source: 'local_fallback' };
    }

    const data = (await response.json()) as any;
    isHealthy = true;

    return {
      source: 'lyzr',
      response: data.response || data.message || JSON.stringify(data),
      agentId,
      sessionId: data.session_id,
    };
  } catch (err) {
    console.error('[Lyzr] invokeAgent failed:', err);
    isHealthy = false;
    return { source: 'local_fallback' };
  }
}

export async function healthCheck(): Promise<{
  status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
  details?: string;
}> {
  if (!isConfigured) {
    return { status: 'NOT_CONFIGURED', details: 'LYZR_API_KEY or LYZR_AGENT_ID not set' };
  }

  try {
    const apiKey = process.env.LYZR_API_KEY!;
    const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/agents/', {
      method: 'GET',
      headers: { 'x-api-key': apiKey },
    });

    if (response.ok) {
      isHealthy = true;
      return { status: 'ONLINE' };
    }

    isHealthy = false;
    return { status: 'OFFLINE', details: `API returned ${response.status}` };
  } catch (err) {
    isHealthy = false;
    return { status: 'OFFLINE', details: (err as Error).message };
  }
}

export function getStatus() {
  return { configured: isConfigured, healthy: isHealthy };
}

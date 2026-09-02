// ─── enkryptService.ts ───────────────────────────────────────────────
// Enkrypt AI Guardrails integration for AI security boundary.
// Protects the agent from prompt injection and adversarial inputs.
// Falls back to local detector when ENKRYPT_API_KEY is not configured.

let isConfigured = false;
let isHealthy = false;

export interface EnkryptResult {
  safe: boolean;
  source: 'enkrypt' | 'local_fallback';
  findings: EnkryptFinding[];
  severity: 'none' | 'warning' | 'critical';
}

export interface EnkryptFinding {
  type: string;
  confidence: number;
  detail: string;
}

export function initEnkrypt(): boolean {
  const apiKey = process.env.ENKRYPT_API_KEY;

  if (!apiKey) {
    console.log('[Enkrypt] Not configured — using local prompt injection detector fallback');
    return false;
  }

  isConfigured = true;
  console.log('[Enkrypt] API key configured');
  return true;
}

export async function checkInputSafety(
  subject: string,
  body: string
): Promise<EnkryptResult> {
  if (!isConfigured) {
    return { safe: true, source: 'local_fallback', findings: [], severity: 'none' };
  }

  try {
    const apiKey = process.env.ENKRYPT_API_KEY!;
    const response = await fetch('https://api.enkryptai.com/guardrails/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: `Subject: ${subject}\n\n${body}`,
        detectors: ['injection_attack', 'jailbreak', 'toxicity'],
      }),
    });

    if (!response.ok) {
      console.error(`[Enkrypt] API returned ${response.status}`);
      isHealthy = false;
      return { safe: true, source: 'local_fallback', findings: [], severity: 'none' };
    }

    const data = (await response.json()) as any;
    isHealthy = true;

    const findings: EnkryptFinding[] = [];
    let hasCritical = false;

    if (data.injection_attack && data.injection_attack.score > 0.5) {
      findings.push({
        type: 'INJECTION_ATTACK',
        confidence: data.injection_attack.score,
        detail: 'Prompt injection attack detected in message content',
      });
      if (data.injection_attack.score > 0.8) hasCritical = true;
    }

    if (data.jailbreak && data.jailbreak.score > 0.5) {
      findings.push({
        type: 'JAILBREAK_ATTEMPT',
        confidence: data.jailbreak.score,
        detail: 'Jailbreak attempt detected — message tries to override security instructions',
      });
      if (data.jailbreak.score > 0.8) hasCritical = true;
    }

    return {
      safe: findings.length === 0,
      source: 'enkrypt',
      findings,
      severity: hasCritical ? 'critical' : findings.length > 0 ? 'warning' : 'none',
    };
  } catch (err) {
    console.error('[Enkrypt] API call failed:', err);
    isHealthy = false;
    return { safe: true, source: 'local_fallback', findings: [], severity: 'none' };
  }
}

export async function healthCheck(): Promise<{
  status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
  details?: string;
}> {
  if (!isConfigured) {
    return { status: 'NOT_CONFIGURED', details: 'ENKRYPT_API_KEY not set' };
  }

  try {
    const apiKey = process.env.ENKRYPT_API_KEY!;
    const response = await fetch('https://api.enkryptai.com/guardrails/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: 'health check test',
        detectors: ['injection_attack'],
      }),
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
  return {
    configured: isConfigured,
    healthy: isHealthy,
  };
}

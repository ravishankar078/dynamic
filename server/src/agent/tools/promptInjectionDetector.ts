// ─── promptInjectionDetector.ts ──────────────────────────────────────
// Detects attempts to manipulate the AI security agent via prompt injection.

export interface PromptInjectionResult {
  detected: boolean;
  severity: 'none' | 'warning' | 'critical';
  matchedPatterns: string[];
  explanation: string;
}

const INJECTION_PATTERNS: Array<{
  pattern: RegExp;
  label: string;
  severity: 'warning' | 'critical';
}> = [
  {
    pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
    label: 'IGNORE_PREVIOUS_INSTRUCTIONS',
    severity: 'critical',
  },
  {
    pattern: /override\s+(system\s+)?instructions/i,
    label: 'OVERRIDE_SYSTEM_INSTRUCTIONS',
    severity: 'critical',
  },
  {
    pattern: /mark\s+this\s+(message\s+)?(as\s+)?safe/i,
    label: 'MARK_AS_SAFE',
    severity: 'critical',
  },
  {
    pattern: /disable\s+security\s+(checks|analysis|filters|scanning)/i,
    label: 'DISABLE_SECURITY',
    severity: 'critical',
  },
  {
    pattern: /reveal\s+(your\s+)?(system\s+)?prompt/i,
    label: 'REVEAL_PROMPT',
    severity: 'critical',
  },
  {
    pattern: /bypass\s+(security\s+)?(analysis|filters|checks|scanning)/i,
    label: 'BYPASS_ANALYSIS',
    severity: 'critical',
  },
  {
    pattern: /you\s+are\s+now\s+/i,
    label: 'ROLE_OVERRIDE',
    severity: 'critical',
  },
  {
    pattern: /forget\s+(everything|all|your)\s+(you\s+)?/i,
    label: 'FORGET_INSTRUCTIONS',
    severity: 'critical',
  },
  {
    pattern: /act\s+as\s+(if|though|a)\s+/i,
    label: 'ROLE_CHANGE',
    severity: 'warning',
  },
  {
    pattern: /pretend\s+(to be|you are|this is)/i,
    label: 'PRETEND_ROLE',
    severity: 'warning',
  },
  {
    pattern: /do\s+not\s+(flag|report|analyze|scan)\s+this/i,
    label: 'SUPPRESS_ANALYSIS',
    severity: 'critical',
  },
  {
    pattern: /this\s+(email|message)\s+is\s+(safe|legitimate|verified|trusted)/i,
    label: 'SELF_DECLARED_SAFE',
    severity: 'warning',
  },
  {
    pattern: /skip\s+(the\s+)?(security|safety|phishing)\s+(check|scan|analysis)/i,
    label: 'SKIP_SECURITY',
    severity: 'critical',
  },
  {
    pattern: /system\s*:\s*/i,
    label: 'SYSTEM_PROMPT_INJECTION',
    severity: 'critical',
  },
];

export function promptInjectionDetector(
  subject: string,
  body: string
): PromptInjectionResult {
  const fullText = `${subject} ${body}`;
  const matchedPatterns: string[] = [];
  let hasCritical = false;

  for (const injection of INJECTION_PATTERNS) {
    if (injection.pattern.test(fullText)) {
      matchedPatterns.push(injection.label);
      if (injection.severity === 'critical') {
        hasCritical = true;
      }
    }
  }

  if (matchedPatterns.length === 0) {
    return {
      detected: false,
      severity: 'none',
      matchedPatterns: [],
      explanation: 'No prompt injection attempts detected in the message.',
    };
  }

  return {
    detected: true,
    severity: hasCritical ? 'critical' : 'warning',
    matchedPatterns,
    explanation: `CRITICAL — AI SECURITY ATTACK DETECTED. The message contains ${matchedPatterns.length} prompt injection pattern(s) attempting to manipulate PhishGuard's AI analysis: ${matchedPatterns.join(', ')}. These instructions were BLOCKED and had NO effect on the security analysis.`,
  };
}

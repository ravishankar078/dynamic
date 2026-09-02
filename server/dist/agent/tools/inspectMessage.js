"use strict";
// ─── inspectMessage.ts ───────────────────────────────────────────────
// Detects social-engineering manipulation signals in email messages.
// Each signal includes actual evidence (quoted text) from the message.
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectMessage = inspectMessage;
const SIGNAL_PATTERNS = [
    {
        signal: 'urgency',
        severity: 'high',
        description: 'Creates time pressure to force hasty action',
        patterns: [
            /\b(urgent|immediately|right away|asap|right now|time.?sensitive)\b/i,
            /\b(within \d+ (hours?|minutes?|days?))\b/i,
            /\b(expires?|expiring|deadline|act now|don'?t delay|hurry)\b/i,
            /\b(last chance|final warning|final notice|limited time)\b/i,
            /\b(as soon as possible|without delay|promptly)\b/i,
        ],
    },
    {
        signal: 'fear_threat',
        severity: 'high',
        description: 'Uses fear or threats to intimidate the recipient',
        patterns: [
            /\b(suspend|disabled?|locked?|terminated?|deleted?|deactivat)\b/i,
            /\b(unauthorized|breach|compromised|hacked|stolen)\b/i,
            /\b(legal action|lawsuit|prosecution|penalty|fine)\b/i,
            /\b(permanently|irreversible|cannot be recovered)\b/i,
            /\b(your account (will be|has been|is being))\b/i,
            /\b(failure to comply|consequences)\b/i,
        ],
    },
    {
        signal: 'authority_pressure',
        severity: 'high',
        description: 'Impersonates authority figures to pressure compliance',
        patterns: [
            /\b(ceo|cfo|cto|coo|president|director|vice president|vp)\b/i,
            /\b(executive|management|board|compliance|legal department)\b/i,
            /\b(on behalf of|authorized by|directed by|requested by)\b/i,
            /\b(i need you to|i('m| am) asking you|do this for me)\b/i,
        ],
    },
    {
        signal: 'secrecy',
        severity: 'critical',
        description: 'Requests secrecy or discretion about the action',
        patterns: [
            /\b(confidential|between us|don'?t tell|keep this quiet)\b/i,
            /\b(do not (share|discuss|mention|forward))\b/i,
            /\b(private matter|discreet|off the record|sensitive matter)\b/i,
            /\b(just between (you and me|us))\b/i,
            /\b(don'?t mention this to)\b/i,
        ],
    },
    {
        signal: 'emotional_manipulation',
        severity: 'medium',
        description: 'Uses emotional language to bypass rational thinking',
        patterns: [
            /\b(trust me|believe me|i promise|i wouldn'?t ask if)\b/i,
            /\b(personal favor|help me out|counting on you|rely on you)\b/i,
            /\b(disappointed|let me down|depend on you)\b/i,
            /\b(special|chosen|selected|exclusive)\b/i,
        ],
    },
    {
        signal: 'reward_manipulation',
        severity: 'medium',
        description: 'Offers rewards or incentives to lure the recipient',
        patterns: [
            /\b(congratulations|you('ve| have) won|prize|reward|bonus)\b/i,
            /\b(free|complimentary|gift|offer|promotion|discount)\b/i,
            /\b(claim your|redeem|collect your)\b/i,
            /\b(lottery|sweepstakes|lucky winner)\b/i,
        ],
    },
    {
        signal: 'financial_request',
        severity: 'critical',
        description: 'Requests financial transactions or payment information',
        patterns: [
            /\b(wire transfer|bank transfer|send money|payment)\b/i,
            /\b(gift card|itunes|google play|amazon card|steam card)\b/i,
            /\b(invoice|purchase order|remittance|bank details)\b/i,
            /\b(bitcoin|crypto|cryptocurrency|western union)\b/i,
            /\b(credit card|debit card|bank account|routing number)\b/i,
        ],
    },
    {
        signal: 'sensitive_info_request',
        severity: 'critical',
        description: 'Requests sensitive personal or organizational information',
        patterns: [
            /\b(password|passcode|pin|credentials|login)\b/i,
            /\b(social security|ssn|tax id|employee id)\b/i,
            /\b(verify your (identity|account|information))\b/i,
            /\b(confirm your (details|information|identity))\b/i,
            /\b(enter your|provide your|share your|send your).{0,30}(password|credentials|login|details)/i,
        ],
    },
    {
        signal: 'unusual_instructions',
        severity: 'high',
        description: 'Contains unusual or suspicious procedural instructions',
        patterns: [
            /\b(click (here|below|this link|the link))\b/i,
            /\b(download (the |this )?(attachment|file|document))\b/i,
            /\b(enable (macros|content|editing))\b/i,
            /\b(install|run|execute|open the attached)\b/i,
            /\b(use (this|the) (link|portal|page) (to|for))\b/i,
            /\b(do not (use|contact|call).{0,30}(normal|regular|usual))\b/i,
        ],
    },
];
function findEvidence(text, patterns) {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            // Extract surrounding context (up to 80 chars around match)
            const idx = match.index || 0;
            const start = Math.max(0, idx - 30);
            const end = Math.min(text.length, idx + match[0].length + 30);
            let snippet = text.substring(start, end).trim();
            if (start > 0)
                snippet = '...' + snippet;
            if (end < text.length)
                snippet = snippet + '...';
            return `"${snippet}"`;
        }
    }
    return null;
}
function inspectMessage(subject, body, sender) {
    const fullText = `${subject} ${body} ${sender}`;
    const signals = [];
    for (const signalDef of SIGNAL_PATTERNS) {
        const evidence = findEvidence(fullText, signalDef.patterns);
        if (evidence) {
            signals.push({
                signal: signalDef.signal,
                severity: signalDef.severity,
                evidence,
                description: signalDef.description,
            });
        }
    }
    // Determine overall manipulation level
    let overallManipulationLevel = 'none';
    if (signals.length === 0) {
        overallManipulationLevel = 'none';
    }
    else if (signals.some((s) => s.severity === 'critical')) {
        overallManipulationLevel = 'critical';
    }
    else if (signals.some((s) => s.severity === 'high')) {
        overallManipulationLevel = signals.length >= 2 ? 'critical' : 'high';
    }
    else if (signals.some((s) => s.severity === 'medium')) {
        overallManipulationLevel = signals.length >= 3 ? 'high' : 'medium';
    }
    else {
        overallManipulationLevel = 'low';
    }
    return { signals, overallManipulationLevel };
}
//# sourceMappingURL=inspectMessage.js.map
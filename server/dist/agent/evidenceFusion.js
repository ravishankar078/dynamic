"use strict";
// ─── evidenceFusion.ts ───────────────────────────────────────────────
// Combines all tool outputs into unified evidence for the risk engine.
// NOW INCLUDES: Enkrypt AI security findings + Qdrant semantic matches.
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceFusion = evidenceFusion;
function evidenceFusion(signals, intent, urlAnalysis, contextAnalysis, threatMemory, promptInjection, enkryptFindings = [], // NEW: Enkrypt AI security evidence
qdrantMatches = [] // NEW: Qdrant semantic evidence
) {
    const positiveRiskEvidence = [];
    const legitimacyEvidence = [];
    const contradictoryEvidence = [];
    // ── ENKRYPT AI SECURITY GATE EVIDENCE ──
    // Enkrypt findings become first-class security evidence.
    // Critical AI attacks (injection/jailbreak at high confidence) get weight 4.
    if (enkryptFindings.length > 0) {
        for (const finding of enkryptFindings) {
            const isCritical = finding.confidence >= 0.75;
            positiveRiskEvidence.push({
                source: 'ENKRYPT_AI',
                type: 'risk',
                description: `Enkrypt AI Security Gate — ${finding.type}: ${finding.detail} (confidence: ${Math.round(finding.confidence * 100)}%)`,
                weight: isCritical ? 4 : 2,
            });
        }
    }
    // ── PROMPT INJECTION ──
    if (promptInjection.detected) {
        positiveRiskEvidence.push({
            source: 'promptInjectionDetector',
            type: 'risk',
            description: promptInjection.explanation,
            weight: 4,
        });
    }
    // ── MANIPULATION SIGNALS ──
    for (const signal of signals) {
        positiveRiskEvidence.push({
            source: 'inspectMessage',
            type: 'risk',
            description: `${signal.signal}: ${signal.description} — Evidence: ${signal.evidence}`,
            weight: signal.severity === 'critical' ? 3 : signal.severity === 'high' ? 2 : 1,
        });
    }
    if (signals.length === 0) {
        legitimacyEvidence.push({
            source: 'inspectMessage',
            type: 'legitimacy',
            description: 'No manipulation signals detected in the message',
            weight: 2,
        });
    }
    // ── INTENT ANALYSIS ──
    if (intent.intent !== 'NORMAL_COMMUNICATION') {
        positiveRiskEvidence.push({
            source: 'determineIntent',
            type: 'risk',
            description: `Detected suspicious intent: ${intent.intent} — ${intent.explanation}`,
            weight: ['ENTER_PASSWORD', 'SEND_MONEY', 'SEND_OTP'].includes(intent.intent) ? 3 : 2,
        });
    }
    else {
        legitimacyEvidence.push({
            source: 'determineIntent',
            type: 'legitimacy',
            description: 'Message intent appears to be normal communication',
            weight: 2,
        });
    }
    // ── URL ANALYSIS ──
    if (urlAnalysis.hasURLs) {
        for (const url of urlAnalysis.urls) {
            if (url.riskLevel === 'dangerous') {
                positiveRiskEvidence.push({
                    source: 'analyzeURL',
                    type: 'risk',
                    description: `Dangerous URL detected: ${url.hostname} — ${url.findings.map((f) => f.detail).join('; ')}`,
                    weight: 3,
                });
            }
            else if (url.riskLevel === 'suspicious') {
                positiveRiskEvidence.push({
                    source: 'analyzeURL',
                    type: 'risk',
                    description: `Suspicious URL: ${url.hostname} — ${url.findings.map((f) => f.detail).join('; ')}`,
                    weight: 2,
                });
            }
            else {
                legitimacyEvidence.push({
                    source: 'analyzeURL',
                    type: 'legitimacy',
                    description: `URL ${url.hostname} appears safe`,
                    weight: 1,
                });
            }
        }
    }
    else {
        legitimacyEvidence.push({
            source: 'analyzeURL',
            type: 'legitimacy',
            description: 'No URLs present in the message',
            weight: 1,
        });
    }
    // ── CONTEXT ANALYSIS ──
    if (contextAnalysis.contextVerdict === 'NORMAL') {
        legitimacyEvidence.push({
            source: 'contextAnalyzer',
            type: 'legitimacy',
            description: contextAnalysis.explanation,
            weight: 2,
        });
    }
    else if (contextAnalysis.contextVerdict === 'SUSPICIOUS') {
        for (const anomaly of contextAnalysis.anomalies) {
            positiveRiskEvidence.push({
                source: 'contextAnalyzer',
                type: 'risk',
                description: anomaly,
                weight: 2,
            });
        }
    }
    // CONTEXT_INCONCLUSIVE — neutral
    // ── LOCAL THREAT MEMORY ──
    if (threatMemory.matchCount > 0) {
        const topMatch = threatMemory.matches[0];
        positiveRiskEvidence.push({
            source: 'threatMemory',
            type: 'risk',
            description: `Matches known threat pattern: ${topMatch.category} (${topMatch.description}). Similarity: ${Math.round(topMatch.similarity * 100)}%`,
            weight: topMatch.similarity >= 0.5 ? 3 : 2,
        });
    }
    else {
        legitimacyEvidence.push({
            source: 'threatMemory',
            type: 'legitimacy',
            description: 'No matches found in known threat database',
            weight: 1,
        });
    }
    // ── QDRANT SEMANTIC THREAT MEMORY ──
    // Qdrant evidence is incorporated as ADDITIONAL evidence, not the sole arbiter.
    // High similarity + matching intent → strong evidence.
    // High similarity alone (different intent) → moderate evidence.
    // Low similarity → no evidence.
    if (qdrantMatches.length > 0) {
        const topMatch = qdrantMatches[0];
        const similarityPct = Math.round(topMatch.score * 100);
        if (topMatch.score >= 0.75) {
            // Strong semantic match
            positiveRiskEvidence.push({
                source: 'QDRANT_MEMORY',
                type: 'risk',
                description: `Qdrant Threat Memory — Strong semantic similarity (${similarityPct}%) to known ${topMatch.attackType} attack. Historical intent: ${topMatch.intent}`,
                weight: topMatch.intent === intent.intent ? 3 : 2,
            });
        }
        else if (topMatch.score >= 0.55) {
            // Moderate semantic match — treat as supporting evidence only
            positiveRiskEvidence.push({
                source: 'QDRANT_MEMORY',
                type: 'risk',
                description: `Qdrant Threat Memory — Partial semantic similarity (${similarityPct}%) to ${topMatch.attackType} pattern`,
                weight: 1,
            });
        }
        // Below 0.55 — insufficient for evidence
    }
    // ── CONTRADICTORY EVIDENCE ──
    if (positiveRiskEvidence.length > 0 && legitimacyEvidence.length > 0) {
        const riskSources = new Set(positiveRiskEvidence.map((e) => e.source));
        const legSources = new Set(legitimacyEvidence.map((e) => e.source));
        const overlapping = [...riskSources].filter((s) => legSources.has(s));
        if (overlapping.length > 0) {
            contradictoryEvidence.push({
                source: 'evidenceFusion',
                type: 'contradictory',
                description: `Mixed signals from: ${overlapping.join(', ')} — both risk and legitimacy indicators present`,
                weight: 1,
            });
        }
    }
    // ── CONFIDENCE ──
    const totalEvidence = positiveRiskEvidence.length + legitimacyEvidence.length;
    const totalWeight = [...positiveRiskEvidence, ...legitimacyEvidence].reduce((sum, e) => sum + e.weight, 0);
    const riskWeight = positiveRiskEvidence.reduce((sum, e) => sum + e.weight, 0);
    const legWeight = legitimacyEvidence.reduce((sum, e) => sum + e.weight, 0);
    const dominance = totalWeight > 0 ? Math.abs(riskWeight - legWeight) / totalWeight : 0;
    const confidence = Math.round(Math.min(0.95, 0.4 + dominance * 0.3 + (Math.min(totalEvidence, 8) / 8) * 0.25) * 100) / 100;
    return {
        positiveRiskEvidence,
        legitimacyEvidence,
        contradictoryEvidence,
        confidence,
    };
}
//# sourceMappingURL=evidenceFusion.js.map
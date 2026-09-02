"use strict";
// ─── riskEngine.ts ───────────────────────────────────────────────────
// Deterministic risk scoring engine. The LLM NEVER decides the final score.
// Starts at TRUST = 50, applies evidence-based adjustments, clamps to 0-100.
// NOW INCLUDES: Qdrant semantic similarity as evidence input (not score arbiter).
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRisk = calculateRisk;
function calculateRisk(signals, intent, urlAnalysis, contextAnalysis, threatMemory, promptInjection, qdrantMatches = [], // NEW: Qdrant semantic evidence
enkryptFindings = [] // NEW: Enkrypt AI security evidence
) {
    let trust = 50;
    const ledger = [];
    function adjust(factor, amount, reason) {
        trust += amount;
        ledger.push({
            factor,
            adjustment: amount,
            reason,
            runningTotal: trust,
        });
    }
    // ── ENKRYPT AI SECURITY GATE ──
    // Enkrypt findings are explicit trust deductions BEFORE any signal processing.
    // This ensures adversarial inputs are penalized first.
    for (const finding of enkryptFindings) {
        if (finding.confidence >= 0.75) {
            adjust('AI Security Gate', -35, `Enkrypt: ${finding.type} detected at ${Math.round(finding.confidence * 100)}% confidence — ${finding.detail}`);
        }
        else if (finding.confidence >= 0.5) {
            adjust('AI Security Warning', -15, `Enkrypt: Possible ${finding.type} detected at ${Math.round(finding.confidence * 100)}% confidence`);
        }
    }
    // ── POSITIVE ADJUSTMENTS (legitimacy) ──
    if (contextAnalysis.senderKnown) {
        adjust('Verified Sender', +20, 'Sender is a known correspondent of the employee');
    }
    if (contextAnalysis.workflowNormal) {
        adjust('Routine Request', +15, "Requested action matches employee's routine workflows");
    }
    if (intent.intent === 'NORMAL_COMMUNICATION') {
        adjust('Normal Pattern', +10, 'Message intent classified as normal communication');
    }
    if (!urlAnalysis.hasURLs) {
        // Neutral
    }
    else if (urlAnalysis.overallURLRisk === 'safe') {
        adjust('Safe URLs', +5, 'All URLs in the message appear legitimate');
    }
    if (threatMemory.matchCount === 0) {
        adjust('No Local Threat Match', +5, 'No matches found in known local threat database');
    }
    // ── NEGATIVE ADJUSTMENTS (risk signals) ──
    const signalTypes = new Set(signals.map((s) => s.signal));
    if (signalTypes.has('urgency')) {
        adjust('Urgency', -15, 'Message creates artificial time pressure');
    }
    if (signalTypes.has('secrecy')) {
        adjust('Secrecy', -20, 'Message requests unusual secrecy about the action');
    }
    if (signalTypes.has('sensitive_info_request')) {
        adjust('Credential Request', -30, 'Message requests sensitive credentials or personal information');
    }
    if (signalTypes.has('financial_request')) {
        adjust('Financial Request', -30, 'Message requests financial transaction or payment');
    }
    if (signalTypes.has('authority_pressure')) {
        adjust('Authority Pressure', -15, 'Message uses authority impersonation to pressure compliance');
    }
    if (signalTypes.has('fear_threat')) {
        adjust('Fear/Threat', -15, 'Message uses fear or threats to intimidate');
    }
    if (signalTypes.has('emotional_manipulation')) {
        adjust('Emotional Manipulation', -10, 'Message uses emotional language to bypass rational thinking');
    }
    if (signalTypes.has('reward_manipulation')) {
        adjust('Reward Manipulation', -10, 'Message offers suspicious rewards or incentives');
    }
    if (signalTypes.has('unusual_instructions')) {
        adjust('Unusual Instructions', -10, 'Message contains unusual procedural instructions');
    }
    if (!contextAnalysis.senderKnown && contextAnalysis.senderRelationship === 'unknown') {
        adjust('Identity Mismatch', -25, 'Sender is not a known correspondent and identity cannot be verified');
    }
    if (!contextAnalysis.actionMatchesRole && contextAnalysis.contextVerdict === 'SUSPICIOUS') {
        adjust('Unusual Action', -20, "Requested action is unusual for the employee's role and department");
    }
    if (promptInjection.detected) {
        adjust('Prompt Injection', -40, 'Message contains prompt injection patterns attempting to manipulate AI analysis');
    }
    if (threatMemory.matchCount > 0 && threatMemory.highestThreatLevel !== 'none') {
        adjust('Local Threat Match', -20, `Message matches known threat pattern: ${threatMemory.matches[0]?.category}`);
    }
    if (urlAnalysis.overallURLRisk === 'dangerous') {
        adjust('URL Mismatch', -25, 'Message contains dangerous or spoofed URLs');
    }
    else if (urlAnalysis.overallURLRisk === 'suspicious') {
        adjust('Suspicious URL', -15, 'Message contains suspicious URLs');
    }
    // ── QDRANT SEMANTIC THREAT MEMORY ──
    // Qdrant evidence is ADDITIONAL input — it NEVER singlehandedly determines the score.
    // Rule: high similarity (≥0.75) + matching intent → -15 trust (strong corroboration)
    //       high similarity (≥0.75) + different intent → -8 trust (partial corroboration)
    //       moderate similarity (0.55–0.74) → -5 trust (supporting evidence only)
    //       below 0.55 → no trust deduction from Qdrant alone
    if (qdrantMatches.length > 0) {
        const topMatch = qdrantMatches[0];
        if (topMatch.score >= 0.75) {
            const intentMatch = topMatch.intent === intent.intent;
            adjust('Qdrant Threat Memory', intentMatch ? -15 : -8, `Semantic similarity ${Math.round(topMatch.score * 100)}% to known ${topMatch.attackType}${intentMatch ? ' (intent confirmed)' : ' (different intent)'}`);
        }
        else if (topMatch.score >= 0.55) {
            adjust('Qdrant Partial Match', -5, `Partial semantic similarity ${Math.round(topMatch.score * 100)}% to ${topMatch.attackType} — supporting evidence`);
        }
        // Below 0.55 — Qdrant similarity alone is insufficient for any trust deduction
    }
    // ── CLAMP ──
    const finalTrust = Math.max(0, Math.min(100, trust));
    const riskScore = 100 - finalTrust;
    let riskLevel;
    if (riskScore <= 30)
        riskLevel = 'LOW';
    else if (riskScore <= 60)
        riskLevel = 'MEDIUM';
    else if (riskScore <= 80)
        riskLevel = 'HIGH';
    else
        riskLevel = 'CRITICAL';
    return {
        startingTrust: 50,
        trustLedger: ledger,
        finalTrust,
        riskScore,
        riskLevel,
    };
}
//# sourceMappingURL=riskEngine.js.map
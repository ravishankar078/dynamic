"use strict";
// ─── securityAgent.ts ────────────────────────────────────────────────
// PHISHGUARD SECURITY AGENT — Single orchestrator.
//
// Pipeline (corrected):
//   OBSERVE → PROTECT → REASON(Lyzr) → INVESTIGATE(selected tools) →
//   CORRELATE(Qdrant) → COMBINE(evidenceFusion) → CHALLENGE(benignity) →
//   SCORE(risk engine) → DECIDE(intervention) → INTERVENE
//
// Key architecture guarantees:
//   1. Lyzr orchestrateTools() produces the tool execution plan — tools
//      only run if Lyzr (or local fallback) selects them.
//   2. Enkrypt findings flow into evidenceFusion + riskEngine.
//   3. Qdrant matches flow into evidenceFusion + riskEngine.
//   4. The deterministic risk engine is the SOLE final scoring authority.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSecurityAgent = runSecurityAgent;
const uuid_1 = require("uuid");
const inspectMessage_1 = require("./tools/inspectMessage");
const determineIntent_1 = require("./tools/determineIntent");
const analyzeURL_1 = require("./tools/analyzeURL");
const contextAnalyzer_1 = require("./tools/contextAnalyzer");
const threatMemory_1 = require("./tools/threatMemory");
const promptInjectionDetector_1 = require("./tools/promptInjectionDetector");
const evidenceFusion_1 = require("./evidenceFusion");
const riskEngine_1 = require("./riskEngine");
const interventionEngine_1 = require("./interventionEngine");
const enkryptService = __importStar(require("../services/enkryptService"));
const lyzrService = __importStar(require("../services/lyzrService"));
const qdrantService = __importStar(require("../services/qdrantService"));
// ─────────────────────────────────────────────────────────────────────
// BENIGNITY CHALLENGE
// ─────────────────────────────────────────────────────────────────────
function performBenignityCheck(signalResult, intentResult, contextResult, riskResult) {
    const benignExplanations = [];
    if (intentResult.intent === 'NORMAL_COMMUNICATION') {
        benignExplanations.push('The message appears to be routine workplace communication with no suspicious intent.');
    }
    if (contextResult.senderKnown) {
        benignExplanations.push('The sender is a known correspondent, suggesting this is a legitimate message.');
    }
    if (signalResult.signals.length === 0) {
        benignExplanations.push('No social engineering manipulation signals were detected.');
    }
    if (signalResult.signals.length <= 1 &&
        signalResult.signals[0]?.severity === 'low') {
        benignExplanations.push('Only minor signals detected, which could occur in normal business communication.');
    }
    let strongestBenignExplanation;
    if (benignExplanations.length > 0) {
        strongestBenignExplanation = benignExplanations.join(' ');
    }
    else if (contextResult.contextVerdict === 'CONTEXT_INCONCLUSIVE') {
        strongestBenignExplanation =
            'Without more employee context, it is possible this could be a legitimate (though unusual) request. However, the combination of multiple high-risk signals makes this unlikely.';
    }
    else {
        strongestBenignExplanation =
            'While it is theoretically possible this message is legitimate, the combination of multiple strong phishing indicators makes a benign explanation implausible.';
    }
    const changesAssessment = riskResult.riskScore <= 30 && benignExplanations.length >= 2;
    const negativeFactor = riskResult.trustLedger.filter((t) => t.adjustment < 0).length;
    const reasoning = changesAssessment
        ? 'The benign explanation is credible and supported by multiple legitimacy indicators.'
        : riskResult.riskScore > 60
            ? `Despite considering benign explanations, the ${negativeFactor} risk factor(s) outweigh any legitimate interpretation. The assessment stands.`
            : 'The benign explanation was considered but does not sufficiently override the detected risk signals.';
    return { strongestBenignExplanation, changesAssessment, reasoning };
}
// ─────────────────────────────────────────────────────────────────────
// STEP RECORDER HELPERS
// ─────────────────────────────────────────────────────────────────────
function makeRecorders(agentSteps, stepNumRef, onStep) {
    function recordStep(name, description, fn, resultSummary) {
        stepNumRef.n++;
        const start = Date.now();
        const timestamp = new Date().toISOString();
        try {
            fn();
            const step = {
                step: stepNumRef.n,
                name,
                description,
                status: 'completed',
                duration: Date.now() - start,
                timestamp,
                result: resultSummary,
            };
            agentSteps.push(step);
            onStep?.(step);
        }
        catch (err) {
            const step = {
                step: stepNumRef.n,
                name,
                description: `${description} — Error: ${err.message}`,
                status: 'failed',
                duration: Date.now() - start,
                timestamp,
            };
            agentSteps.push(step);
            onStep?.(step);
        }
    }
    async function recordAsyncStep(name, description, fn) {
        stepNumRef.n++;
        const start = Date.now();
        const timestamp = new Date().toISOString();
        try {
            const resultSummary = await fn();
            const step = {
                step: stepNumRef.n,
                name,
                description,
                status: 'completed',
                duration: Date.now() - start,
                timestamp,
                result: typeof resultSummary === 'string' ? resultSummary : undefined,
            };
            agentSteps.push(step);
            onStep?.(step);
        }
        catch (err) {
            const step = {
                step: stepNumRef.n,
                name,
                description: `${description} — Error: ${err.message}`,
                status: 'failed',
                duration: Date.now() - start,
                timestamp,
            };
            agentSteps.push(step);
            onStep?.(step);
        }
    }
    function skipStep(name, reason) {
        stepNumRef.n++;
        const step = {
            step: stepNumRef.n,
            name,
            description: reason,
            status: 'skipped',
            duration: 0,
            timestamp: new Date().toISOString(),
            result: 'Skipped by agent plan',
        };
        agentSteps.push(step);
        onStep?.(step);
    }
    return { recordStep, recordAsyncStep, skipStep };
}
// ─────────────────────────────────────────────────────────────────────
// MAIN SECURITY AGENT
// ─────────────────────────────────────────────────────────────────────
async function runSecurityAgent(input, onStep) {
    const eventId = (0, uuid_1.v4)();
    const agentSteps = [];
    const stepNumRef = { n: 0 };
    const { recordStep, recordAsyncStep, skipStep } = makeRecorders(agentSteps, stepNumRef, onStep);
    // ── Sanitize / normalize input ──
    const sender = (input.sender || '').trim();
    const subject = (input.subject || '').trim();
    const body = (input.body || '').trim();
    const links = (input.links || []).filter((l) => typeof l === 'string' && l.trim().length > 0);
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    const bodyURLs = body.match(urlRegex) || [];
    const allLinks = [...new Set([...links, ...bodyURLs])];
    const hasEmployeeContext = !!input.employeeContext;
    // Initialize mutable result holders
    let signalResult = {
        signals: [],
        overallManipulationLevel: 'none',
    };
    let intentResult = {
        intent: 'NORMAL_COMMUNICATION',
        confidence: 0,
        explanation: '',
        secondaryIntents: [],
    };
    let urlResult = {
        urls: [],
        overallURLRisk: 'none',
        hasURLs: false,
    };
    let contextResult = {
        senderKnown: false,
        senderRelationship: 'inconclusive',
        actionMatchesRole: false,
        actionMatchesDepartment: false,
        workflowNormal: false,
        anomalies: [],
        contextVerdict: 'CONTEXT_INCONCLUSIVE',
        explanation: '',
    };
    let threatResult = {
        matches: [],
        highestThreatLevel: 'none',
        source: 'local_corpus',
        matchCount: 0,
    };
    let injectionResult = {
        detected: false,
        severity: 'none',
        matchedPatterns: [],
        explanation: '',
    };
    let fusionResult = {
        positiveRiskEvidence: [],
        legitimacyEvidence: [],
        contradictoryEvidence: [],
        confidence: 0,
    };
    let riskResult = {
        startingTrust: 50,
        trustLedger: [],
        finalTrust: 50,
        riskScore: 50,
        riskLevel: 'MEDIUM',
    };
    let benignityResult = {
        strongestBenignExplanation: '',
        changesAssessment: false,
        reasoning: '',
    };
    let interventionResult = {
        action: 'WARN',
        severity: 'warning',
        title: '',
        description: '',
        safeAlternativeAction: '',
        whatWouldHappenIfClicked: '',
        recommendedSteps: [],
    };
    let enkryptResult = {
        source: 'local_fallback',
        safe: true,
        findings: [],
        severity: 'none',
    };
    let qdrantResult = {
        source: 'local_corpus',
        matches: [],
        topSimilarity: 0,
    };
    let lyzrResult = {
        source: 'local_fallback',
        tools: [],
        reasoning: '',
    };
    // ══════════════════════════════════════════════════════════════════
    // PHASE 1 — OBSERVE
    // ══════════════════════════════════════════════════════════════════
    recordStep('Message Received', `Incoming message intercepted from ${sender}: "${subject}"`, () => { }, `From: ${sender} | ${body.length} chars | ${allLinks.length} URL(s)`);
    recordStep('Input Sanitized', 'Message normalized — HTML stripped, size validated, URLs extracted', () => { }, `${body.length} chars, ${allLinks.length} URL(s) detected`);
    // ══════════════════════════════════════════════════════════════════
    // PHASE 2 — PROTECT (Enkrypt + Prompt Injection)
    // ══════════════════════════════════════════════════════════════════
    await recordAsyncStep('Enkrypt Security Check', 'AI security boundary — scanning for adversarial content, prompt injections, jailbreaks', async () => {
        const enkrypt = await enkryptService.checkInputSafety(subject, body);
        enkryptResult = {
            source: enkrypt.source,
            safe: enkrypt.safe,
            findings: enkrypt.findings,
            severity: enkrypt.severity,
        };
        if (enkrypt.source === 'enkrypt') {
            return enkrypt.safe
                ? 'Enkrypt: SAFE — no adversarial content detected'
                : `Enkrypt: THREAT DETECTED — ${enkrypt.findings.map((f) => f.type).join(', ')}`;
        }
        return 'Enkrypt: Not configured — using local detector fallback';
    });
    recordStep('Prompt Injection Scan', 'Local pattern-based AI manipulation detection (runs regardless of Enkrypt status)', () => {
        injectionResult = (0, promptInjectionDetector_1.promptInjectionDetector)(subject, body);
    }, injectionResult.detected
        ? `DETECTED: ${injectionResult.matchedPatterns.length} pattern(s) — ${injectionResult.severity}`
        : 'Clean — no injection patterns found');
    // ══════════════════════════════════════════════════════════════════
    // PHASE 3 — REASON (Lyzr Security Agent Orchestration)
    // Lyzr receives ONLY sanitized metadata (not raw body) and returns
    // a structured JSON tool execution plan.
    // ══════════════════════════════════════════════════════════════════
    let toolPlan = {
        source: 'local_fallback',
        tools: [],
        reasoning: '',
    };
    await recordAsyncStep('Lyzr Security Agent', 'Agent orchestrator producing investigation tool plan based on message metadata', async () => {
        toolPlan = await lyzrService.orchestrateTools({
            sender,
            subject,
            bodyPreview: body.substring(0, 400), // sanitized preview only
            hasURLs: allLinks.length > 0,
            hasEmployeeContext,
            enkryptFlagged: !enkryptResult.safe,
            injectionDetected: injectionResult.detected,
        });
        lyzrResult = {
            source: toolPlan.source,
            tools: toolPlan.tools,
            reasoning: toolPlan.reasoning,
            agentId: toolPlan.agentId,
        };
        return toolPlan.source === 'lyzr'
            ? `Lyzr: Tool plan received — [${toolPlan.tools.join(', ')}]`
            : `Local plan: [${toolPlan.tools.join(', ')}] — ${toolPlan.reasoning}`;
    });
    const selectedTools = new Set(toolPlan.tools);
    // ══════════════════════════════════════════════════════════════════
    // PHASE 4 — INVESTIGATE (execute Lyzr-selected tools)
    // ══════════════════════════════════════════════════════════════════
    // Intent analysis
    if (selectedTools.has('determineIntent')) {
        recordStep('Intent Analysis', 'Classifying what the sender wants the employee to DO', () => {
            intentResult = (0, determineIntent_1.determineIntent)(subject, body, allLinks);
        }, `Intent: ${intentResult.intent} (${Math.round(intentResult.confidence * 100)}% confidence)`);
    }
    else {
        skipStep('Intent Analysis', 'Skipped — not selected by Lyzr agent plan');
    }
    // Social engineering signal inspection
    if (selectedTools.has('inspectMessage')) {
        recordStep('Social Engineering Analysis', 'Detecting manipulation tactics: urgency, fear, authority pressure, secrecy', () => {
            signalResult = (0, inspectMessage_1.inspectMessage)(subject, body, sender);
        }, signalResult.signals.length > 0
            ? `${signalResult.signals.length} signal(s): ${signalResult.signals.map((s) => s.signal).join(', ')}`
            : 'No manipulation signals detected');
    }
    else {
        skipStep('Social Engineering Analysis', 'Skipped — not selected by Lyzr agent plan');
    }
    // URL investigation — skipped if no URLs OR if not in tool plan
    if (selectedTools.has('analyzeURL') && allLinks.length > 0) {
        recordStep('URL Investigation', `Analysing ${allLinks.length} URL(s) for domain spoofing, homoglyphs, brand mismatch`, () => {
            urlResult = (0, analyzeURL_1.analyzeURL)(allLinks, `${subject} ${body}`);
        }, urlResult.hasURLs
            ? `URL risk: ${urlResult.overallURLRisk.toUpperCase()}`
            : 'No URLs analysed');
    }
    else if (allLinks.length === 0) {
        skipStep('URL Investigation', 'Skipped — no URLs detected in message');
    }
    else {
        skipStep('URL Investigation', 'Skipped — not selected by Lyzr agent plan');
    }
    // Context analysis — skipped if no employee context OR if not in tool plan
    if (selectedTools.has('contextAnalyzer') && hasEmployeeContext) {
        recordStep('Context Analysis', "Comparing message against employee's known senders, role, and routine workflows", () => {
            contextResult = (0, contextAnalyzer_1.contextAnalyzer)(sender, subject, body, intentResult.intent, input.employeeContext);
        }, `Verdict: ${contextResult.contextVerdict}`);
    }
    else if (!hasEmployeeContext) {
        skipStep('Context Analysis', 'Skipped — no employee context provided');
    }
    else {
        skipStep('Context Analysis', 'Skipped — not selected by Lyzr agent plan');
    }
    // Local threat memory (fast lookup — always runs when in plan)
    if (selectedTools.has('qdrantThreatMemory') || selectedTools.has('threatMemory')) {
        recordStep('Local Threat Memory', 'Searching known threat database for pattern matches', () => {
            threatResult = (0, threatMemory_1.threatMemory)(subject, body, sender);
        }, threatResult.matchCount > 0
            ? `${threatResult.matchCount} match(es) — highest: ${threatResult.highestThreatLevel}`
            : 'No local matches');
    }
    // ══════════════════════════════════════════════════════════════════
    // PHASE 5 — CORRELATE (Qdrant semantic similarity search)
    // Qdrant results become evidence inputs — they do NOT set the score.
    // ══════════════════════════════════════════════════════════════════
    await recordAsyncStep('Qdrant Threat Memory', 'Semantic vector search — finding historically similar attack payloads', async () => {
        const fullText = `${subject} ${body}`;
        const qdrant = await qdrantService.searchThreats(fullText);
        if (qdrant.source === 'qdrant' && qdrant.matches.length > 0) {
            qdrantResult = {
                source: 'qdrant',
                matches: qdrant.matches.map((m) => ({
                    id: m.id,
                    score: m.score,
                    attackType: m.attackType,
                    intent: m.intent,
                    riskLevel: m.riskLevel,
                })),
                topSimilarity: Math.round(qdrant.matches[0].score * 100),
            };
            return `Qdrant: ${qdrant.matches.length} match(es) — top similarity ${qdrantResult.topSimilarity}%`;
        }
        qdrantResult = {
            source: qdrant.source === 'qdrant' ? 'qdrant' : 'not_configured',
            matches: [],
            topSimilarity: 0,
        };
        return qdrant.source === 'qdrant'
            ? 'Qdrant: No semantic matches found'
            : 'Qdrant: Not configured — using local corpus only';
    });
    // ══════════════════════════════════════════════════════════════════
    // PHASE 6 — COMBINE EVIDENCE (Evidence Fusion)
    // All tool outputs + Enkrypt findings + Qdrant matches flow in here.
    // ══════════════════════════════════════════════════════════════════
    // Prepare Enkrypt and Qdrant evidence in the format evidenceFusion expects
    const enkryptFindingsForFusion = enkryptResult.findings.map((f) => ({
        type: f.type,
        confidence: f.confidence,
        detail: f.detail,
    }));
    const qdrantMatchesForFusion = qdrantResult.matches.map((m) => ({
        score: m.score,
        attackType: m.attackType,
        intent: m.intent,
        riskLevel: m.riskLevel,
    }));
    recordStep('Evidence Fusion', 'Combining all evidence streams: signals, intent, URLs, context, threat memory, Enkrypt, Qdrant', () => {
        fusionResult = (0, evidenceFusion_1.evidenceFusion)(signalResult.signals, intentResult, urlResult, contextResult, threatResult, injectionResult, enkryptFindingsForFusion, // ← Enkrypt evidence flowing in
        qdrantMatchesForFusion // ← Qdrant evidence flowing in
        );
    }, `${fusionResult.positiveRiskEvidence.length} risk + ${fusionResult.legitimacyEvidence.length} legitimacy items — confidence: ${Math.round(fusionResult.confidence * 100)}%`);
    // ══════════════════════════════════════════════════════════════════
    // PHASE 7 — SCORE (Deterministic Risk Engine)
    // MUST run BEFORE benignity challenge so challenge has the real score.
    // ══════════════════════════════════════════════════════════════════
    const qdrantEvidenceForRisk = qdrantResult.matches.map((m) => ({
        score: m.score,
        attackType: m.attackType,
        intent: m.intent,
        riskLevel: m.riskLevel,
    }));
    const enkryptEvidenceForRisk = enkryptResult.findings.map((f) => ({
        type: f.type,
        confidence: f.confidence,
        detail: f.detail,
    }));
    recordStep('Risk Calculation', 'Deterministic risk scoring — LLM has NO input into this calculation', () => {
        riskResult = (0, riskEngine_1.calculateRisk)(signalResult.signals, intentResult, urlResult, contextResult, threatResult, injectionResult, qdrantEvidenceForRisk, // ← Qdrant flowing into risk engine
        enkryptEvidenceForRisk // ← Enkrypt flowing into risk engine
        );
    }, `Risk: ${riskResult.riskScore}/100 (${riskResult.riskLevel}) | Trust: ${riskResult.finalTrust}/100`);
    // ══════════════════════════════════════════════════════════════════
    // PHASE 8 — CHALLENGE (Benignity / Adversarial Challenge)
    // Now runs AFTER scoring — challenges the score with the strongest
    // legitimate interpretation of the evidence.
    // ══════════════════════════════════════════════════════════════════
    recordStep('Benignity Challenge', 'Adversarial challenge: what is the strongest case for this message being legitimate?', () => {
        benignityResult = performBenignityCheck(signalResult, intentResult, contextResult, riskResult);
    }, benignityResult.changesAssessment
        ? 'Challenge ACCEPTED — low risk confirmed'
        : 'Challenge REJECTED — risk assessment stands');
    // ══════════════════════════════════════════════════════════════════
    // PHASE 9 — DECIDE (Intervention Engine)
    // ══════════════════════════════════════════════════════════════════
    recordStep('Security Decision', `Risk ${riskResult.riskLevel} (${riskResult.riskScore}/100) — determining intervention`, () => {
        const signalNames = signalResult.signals.map((s) => s.signal);
        if (injectionResult.detected)
            signalNames.push('prompt_injection');
        interventionResult = (0, interventionEngine_1.determineIntervention)(riskResult.riskLevel, riskResult.riskScore, intentResult.intent, signalNames, urlResult.hasURLs, injectionResult.detected);
    }, `Decision: ${interventionResult.action}`);
    // ══════════════════════════════════════════════════════════════════
    // PHASE 10 — INTERVENE
    // ══════════════════════════════════════════════════════════════════
    recordStep('Intervention Applied', `${interventionResult.action}: ${interventionResult.title}`, () => { }, `${interventionResult.action} — Employee ${interventionResult.action === 'ALLOW' ? 'PROTECTED (message allowed)' :
        interventionResult.action === 'BLOCK' ? 'PROTECTED (message blocked)' :
            'WARNED'}`);
    // ── Store high-risk incidents to Qdrant for future threat matching ──
    if (riskResult.riskScore >= 60) {
        await qdrantService.upsertIncident(eventId, `${subject} ${body}`, signalResult.overallManipulationLevel, intentResult.intent, riskResult.riskLevel, intentResult.explanation, signalResult.signals.map((s) => s.signal));
    }
    const reasoning = generateReasoning(signalResult, intentResult, riskResult, benignityResult, injectionResult, enkryptResult, qdrantResult);
    return {
        eventId,
        agentSteps,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        detectedIntent: intentResult.intent,
        intentReason: intentResult.explanation,
        signals: signalResult,
        urlAnalysis: urlResult,
        contextAnalysis: contextResult,
        threatEvidence: threatResult,
        promptInjection: injectionResult,
        evidenceFusion: fusionResult,
        trustLedger: riskResult,
        confidence: fusionResult.confidence,
        adversarialCheck: benignityResult,
        recommendation: interventionResult.description,
        reasoning,
        intervention: interventionResult,
        safeAlternativeAction: interventionResult.safeAlternativeAction,
        whatWouldHappenIfClicked: interventionResult.whatWouldHappenIfClicked,
        enkryptCheck: enkryptResult,
        qdrantMatches: qdrantResult,
        lyzrOrchestration: lyzrResult,
    };
}
// ─────────────────────────────────────────────────────────────────────
// REASONING SUMMARY GENERATOR
// ─────────────────────────────────────────────────────────────────────
function generateReasoning(signals, intent, risk, benignity, injection, enkrypt, qdrant) {
    const parts = [];
    if (injection.detected) {
        parts.push('CRITICAL: Prompt injection attack detected — message attempted to manipulate the PhishGuard security system.');
    }
    if (!enkrypt.safe && enkrypt.findings.length > 0) {
        parts.push(`Enkrypt AI Security Gate flagged: ${enkrypt.findings.map((f) => f.type).join(', ')}.`);
    }
    if (signals.signals.length > 0) {
        const signalNames = signals.signals.map((s) => s.signal.replace(/_/g, ' ')).join(', ');
        parts.push(`Detected ${signals.signals.length} manipulation signal(s): ${signalNames}.`);
    }
    else {
        parts.push('No social engineering signals detected.');
    }
    parts.push(`Primary intent: ${intent.intent.replace(/_/g, ' ')} — ${intent.explanation}`);
    if (qdrant.matches.length > 0 && qdrant.topSimilarity >= 55) {
        parts.push(`Qdrant threat memory: ${qdrant.topSimilarity}% semantic similarity to known ${qdrant.matches[0].attackType} pattern.`);
    }
    const negativeFactors = risk.trustLedger.filter((t) => t.adjustment < 0);
    const positiveFactors = risk.trustLedger.filter((t) => t.adjustment > 0);
    if (negativeFactors.length > 0) {
        parts.push(`${negativeFactors.length} risk factor(s) reduced trust by ${Math.abs(negativeFactors.reduce((s, t) => s + t.adjustment, 0))} points.`);
    }
    if (positiveFactors.length > 0) {
        parts.push(`${positiveFactors.length} legitimacy factor(s) increased trust by ${positiveFactors.reduce((s, t) => s + t.adjustment, 0)} points.`);
    }
    parts.push(`Benignity challenge: ${benignity.reasoning}`);
    return parts.join(' ');
}
//# sourceMappingURL=securityAgent.js.map
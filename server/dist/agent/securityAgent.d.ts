import { InspectMessageResult } from './tools/inspectMessage';
import { AnalyzeURLResult } from './tools/analyzeURL';
import { ContextAnalysisResult, EmployeeContext } from './tools/contextAnalyzer';
import { ThreatMemoryResult } from './tools/threatMemory';
import { PromptInjectionResult } from './tools/promptInjectionDetector';
import { EvidenceFusionResult } from './evidenceFusion';
import { RiskEngineResult } from './riskEngine';
import { InterventionResult } from './interventionEngine';
export interface AgentStep {
    step: number;
    name: string;
    description: string;
    status: 'completed' | 'failed' | 'skipped';
    duration: number;
    timestamp: string;
    result?: string;
}
export interface BenignityCheck {
    strongestBenignExplanation: string;
    changesAssessment: boolean;
    reasoning: string;
}
export interface EnkryptCheckResult {
    source: string;
    safe: boolean;
    findings: Array<{
        type: string;
        confidence: number;
        detail: string;
    }>;
    severity: string;
}
export interface QdrantMatchResult {
    source: string;
    matches: Array<{
        id: string;
        score: number;
        attackType: string;
        intent: string;
        riskLevel: string;
    }>;
    topSimilarity: number;
}
export interface LyzrOrchestratorResult {
    source: string;
    agentId?: string;
    tools: string[];
    reasoning: string;
}
export interface AnalysisInput {
    sender: string;
    subject: string;
    body: string;
    links: string[];
    employeeContext?: EmployeeContext;
}
export interface AnalysisResult {
    eventId: string;
    agentSteps: AgentStep[];
    riskScore: number;
    riskLevel: string;
    detectedIntent: string;
    intentReason: string;
    signals: InspectMessageResult;
    urlAnalysis: AnalyzeURLResult;
    contextAnalysis: ContextAnalysisResult;
    threatEvidence: ThreatMemoryResult;
    promptInjection: PromptInjectionResult;
    evidenceFusion: EvidenceFusionResult;
    trustLedger: RiskEngineResult;
    confidence: number;
    adversarialCheck: BenignityCheck;
    recommendation: string;
    reasoning: string;
    intervention: InterventionResult;
    safeAlternativeAction: string;
    whatWouldHappenIfClicked: string;
    enkryptCheck: EnkryptCheckResult;
    qdrantMatches: QdrantMatchResult;
    lyzrOrchestration: LyzrOrchestratorResult;
}
type StepCallback = (step: AgentStep) => void;
export declare function runSecurityAgent(input: AnalysisInput, onStep?: StepCallback): Promise<AnalysisResult>;
export {};
//# sourceMappingURL=securityAgent.d.ts.map